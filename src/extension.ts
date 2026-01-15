import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Client, ConnectConfig, SFTPWrapper } from 'ssh2';

// Output channel for logging
let outputChannel: vscode.OutputChannel;

/**
 * SSH configuration interface
 */
interface SSHConfig {
    server: string;
    path: string;
    user: string;
    pass: string;
}

/**
 * File upload result interface
 */
interface UploadResult {
    localPath: string;
    remotePath: string;
    status: 'ok' | 'error' | 'skipped';
    message?: string;
}

/**
 * Activate extension
 */
export function activate(context: vscode.ExtensionContext) {
    // Create output channel
    outputChannel = vscode.window.createOutputChannel('SSH Put');

    // Register configure command
    const configureCommand = vscode.commands.registerCommand('ssh.configure', async () => {
        await configureSSH();
    });

    // Register put command
    const putCommand = vscode.commands.registerCommand('ssh.put', async () => {
        await uploadOpenFiles();
    });

    // Register about command
    const aboutCommand = vscode.commands.registerCommand('ssh.about', () => {
        const author = 'Alejandro Flamerich';
        const title = 'SSH Put';
        vscode.window.showInformationMessage(`${title} — Desarrollado por ${author}`);
    });

    context.subscriptions.push(configureCommand, putCommand, aboutCommand, outputChannel);

    console.log('SSH Put extension is now active');
}

/**
 * Deactivate extension
 */
export function deactivate() {
    if (outputChannel) {
        outputChannel.dispose();
    }
}

/**
 * Configure SSH settings through input boxes
 */
async function configureSSH(): Promise<void> {
    const config = vscode.workspace.getConfiguration('ssh');

    // Get server
    const server = await vscode.window.showInputBox({
        prompt: 'Enter SSH server hostname or IP address',
        value: config.get<string>('server') || '',
        placeHolder: 'example.com or 192.168.1.100'
    });

    if (server === undefined) {
        return; // User cancelled
    }

    // Get path
    const remotePath = await vscode.window.showInputBox({
        prompt: 'Enter remote base path',
        value: config.get<string>('path') || '',
        placeHolder: '/var/www/app'
    });

    if (remotePath === undefined) {
        return;
    }

    // Get user
    const user = await vscode.window.showInputBox({
        prompt: 'Enter SSH username',
        value: config.get<string>('user') || '',
        placeHolder: 'root'
    });

    if (user === undefined) {
        return;
    }

    // Get password with masking
    const pass = await vscode.window.showInputBox({
        prompt: 'Enter SSH password',
        value: config.get<string>('pass') || '',
        password: true,
        placeHolder: 'password'
    });

    if (pass === undefined) {
        return;
    }

    // Save configuration
    try {
        await config.update('server', server, vscode.ConfigurationTarget.Workspace);
        await config.update('path', remotePath, vscode.ConfigurationTarget.Workspace);
        await config.update('user', user, vscode.ConfigurationTarget.Workspace);
        await config.update('pass', pass, vscode.ConfigurationTarget.Workspace);

        vscode.window.showInformationMessage('SSH configuration saved successfully');
        outputChannel.appendLine('SSH configuration updated');
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to save configuration: ${error}`);
    }
}

/**
 * Get SSH configuration from settings
 */
function getConfig(): SSHConfig | null {
    const config = vscode.workspace.getConfiguration('ssh');

    const server = config.get<string>('server') || '';
    const remotePath = config.get<string>('path') || '';
    const user = config.get<string>('user') || '';
    const pass = config.get<string>('pass') || '';

    if (!server || !remotePath || !user || !pass) {
        return null;
    }

    return {
        server,
        path: remotePath,
        user,
        pass
    };
}

/**
 * Ensure configuration exists, prompt user if not
 */
async function ensureConfig(): Promise<SSHConfig | null> {
    const config = getConfig();

    if (!config) {
        const action = await vscode.window.showWarningMessage(
            'SSH configuration is incomplete. Please configure SSH settings.',
            'Configure Now'
        );

        if (action === 'Configure Now') {
            await configureSSH();
            return getConfig();
        }

        return null;
    }

    return config;
}

/**
 * Get list of open workspace files
 * Returns array of objects with localPath, relativePath, and workspaceFolder
 * Only includes files that are visibly open in editor tabs
 */
function getOpenWorkspaceFiles(): Array<{
    localPath: string;
    relativePath: string;
    workspaceFolder: vscode.WorkspaceFolder;
}> {
    const openFiles: Array<{
        localPath: string;
        relativePath: string;
        workspaceFolder: vscode.WorkspaceFolder;
    }> = [];

    const seen = new Set<string>();

    // Get all tab groups (editor groups)
    for (const tabGroup of vscode.window.tabGroups.all) {
        // Iterate through all tabs in the group
        for (const tab of tabGroup.tabs) {
            // Get the tab input
            const tabInput = tab.input;

            // Check if it's a text document tab
            if (tabInput && typeof tabInput === 'object' && 'uri' in tabInput) {
                const uri = (tabInput as { uri: vscode.Uri }).uri;

                // Only consider files with "file" scheme (real files on disk)
                if (uri.scheme !== 'file') {
                    continue;
                }

                const localPath = uri.fsPath;

                // Avoid duplicates
                if (seen.has(localPath)) {
                    continue;
                }
                seen.add(localPath);

                // Find workspace folder for this file
                const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);

                if (!workspaceFolder) {
                    continue; // Skip files not in workspace
                }

                // Calculate relative path
                const relativePath = path.relative(workspaceFolder.uri.fsPath, localPath);

                openFiles.push({
                    localPath,
                    relativePath,
                    workspaceFolder
                });
            }
        }
    }

    return openFiles;
}

/**
 * Save all dirty open documents
 */
async function saveAllOpenDocuments(): Promise<void> {
    const dirtyDocuments = vscode.workspace.textDocuments.filter(doc => doc.isDirty && doc.uri.scheme === 'file');

    if (dirtyDocuments.length > 0) {
        outputChannel.appendLine(`Saving ${dirtyDocuments.length} unsaved file(s)...`);

        for (const doc of dirtyDocuments) {
            await doc.save();
        }
    }
}

/**
 * Create remote directory recursively via SFTP
 */
async function mkdirpRemote(sftp: SFTPWrapper, remotePath: string): Promise<void> {
    const parts = remotePath.split('/').filter(p => p.length > 0);
    let currentPath = '';

    for (const part of parts) {
        currentPath += '/' + part;

        try {
            // Try to stat the directory
            await new Promise<void>((resolve, reject) => {
                sftp.stat(currentPath, (err, _stats) => {
                    if (err) {
                        // Directory doesn't exist, try to create it
                        sftp.mkdir(currentPath, (mkdirErr) => {
                            if (mkdirErr) {
                                reject(mkdirErr);
                            } else {
                                resolve();
                            }
                        });
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error) {
            // Ignore errors if directory already exists
            // The stat error might mean it doesn't exist, and mkdir error might mean it already exists
        }
    }
}

/**
 * Upload a single file via SFTP
 */
async function uploadFile(
    sftp: SFTPWrapper,
    localPath: string,
    remotePath: string
): Promise<void> {
    // Ensure remote directory exists
    const remoteDir = path.dirname(remotePath).replace(/\\/g, '/');
    await mkdirpRemote(sftp, remoteDir);

    // Upload file and then preserve timestamp and permissions
    return new Promise<void>((resolve, reject) => {
        sftp.fastPut(localPath, remotePath, async (err) => {
            if (err) {
                reject(err);
                return;
            }

            try {
                // Read local file stats
                const stats = await new Promise<fs.Stats>((res, rej) => {
                    fs.stat(localPath, (e, s) => (e ? rej(e) : res(s)));
                });

                // Preserve modification and access times on remote (utimes expects seconds)
                const atime = Math.floor(stats.atime.getTime() / 1000);
                const mtime = Math.floor(stats.mtime.getTime() / 1000);

                await new Promise<void>((res) => {
                    // @ts-ignore - some typings may not include utimes overloads
                    sftp.utimes(remotePath, atime, mtime, (uErr) => {
                        if (uErr) {
                            // Not fatal: log and continue
                            outputChannel.appendLine(`Warning: failed to preserve times for ${remotePath}: ${uErr.message}`);
                        }
                        res();
                    });
                });

                // Preserve mode (permissions)
                const mode = stats.mode & 0o777;
                await new Promise<void>((res) => {
                    sftp.chmod(remotePath, mode, (cErr) => {
                        if (cErr) {
                            outputChannel.appendLine(`Warning: failed to set permissions for ${remotePath}: ${cErr.message}`);
                        }
                        res();
                    });
                });

                resolve();
            } catch (ex) {
                // If any of the preservation steps fail, still resolve upload but warn
                const msg = ex instanceof Error ? ex.message : String(ex);
                outputChannel.appendLine(`Warning: post-upload preservation failed for ${remotePath}: ${msg}`);
                resolve();
            }
        });
    });
}

/**
 * Connect to SSH server and return SFTP wrapper
 */
async function connectSSH(config: SSHConfig): Promise<{ client: Client; sftp: SFTPWrapper }> {
    const client = new Client();

    return new Promise((resolve, reject) => {
        const connectConfig: ConnectConfig = {
            host: config.server,
            port: 22,
            username: config.user,
            password: config.pass,
            readyTimeout: 10000
        };

        client.on('ready', () => {
            outputChannel.appendLine('SSH connection established');
            console.log('SSH connection ready');

            // Get SFTP subsystem
            client.sftp((err, sftp) => {
                if (err) {
                    client.end();
                    reject(new Error(`Failed to start SFTP: ${err.message}`));
                } else {
                    outputChannel.appendLine('SFTP session started');
                    resolve({ client, sftp });
                }
            });
        });

        client.on('error', (err) => {
            reject(new Error(`SSH connection error: ${err.message}`));
        });

        try {
            client.connect(connectConfig);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Main function to upload open files
 */
async function uploadOpenFiles(): Promise<void> {
    // Ensure configuration exists
    const config = await ensureConfig();
    if (!config) {
        outputChannel.appendLine('Upload cancelled: configuration incomplete');
        return;
    }

    outputChannel.clear();
    outputChannel.show(true);
    outputChannel.appendLine('='.repeat(60));
    outputChannel.appendLine('SSH Put - Upload Open Files');
    outputChannel.appendLine('='.repeat(60));
    outputChannel.appendLine(`Server: ${config.server}`);
    outputChannel.appendLine(`Remote base path: ${config.path}`);
    outputChannel.appendLine(`User: ${config.user}`);
    outputChannel.appendLine('='.repeat(60));

    console.log('Starting SSH Put upload...');
    console.log(`Target: ${config.user}@${config.server}:${config.path}`);

    // Save all dirty documents
    await saveAllOpenDocuments();

    // Get open files
    const openFiles = getOpenWorkspaceFiles();

    if (openFiles.length === 0) {
        vscode.window.showInformationMessage('No workspace files are currently open');
        outputChannel.appendLine('No workspace files to upload');
        return;
    }

    outputChannel.appendLine(`Found ${openFiles.length} open file(s) to upload`);
    outputChannel.appendLine('');

    // Upload with progress
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: 'Uploading files via SSH',
            cancellable: false
        },
        async (progress) => {
            const results: UploadResult[] = [];
            let client: Client | null = null;
            let sftp: SFTPWrapper | null = null;

            try {
                // Connect to SSH
                outputChannel.appendLine('Connecting to SSH server...');
                progress.report({ message: 'Connecting...' });

                const connection = await connectSSH(config);
                client = connection.client;
                sftp = connection.sftp;

                outputChannel.appendLine('Connected successfully');
                outputChannel.appendLine('');

                // Upload each file
                let uploaded = 0;

                for (const file of openFiles) {
                    const remotePath = path.posix.join(config.path, file.relativePath.replace(/\\/g, '/'));

                    outputChannel.appendLine(`[${uploaded + 1}/${openFiles.length}] Uploading: ${file.relativePath}`);
                    outputChannel.appendLine(`  Local:  ${file.localPath}`);
                    outputChannel.appendLine(`  Remote: ${remotePath}`);

                    progress.report({
                        message: `${uploaded + 1}/${openFiles.length}: ${path.basename(file.localPath)}`,
                        increment: (100 / openFiles.length)
                    });

                    console.log(`Uploading ${file.relativePath} -> ${remotePath}`);

                    try {
                        await uploadFile(sftp, file.localPath, remotePath);
                        outputChannel.appendLine('  ✓ Done');
                        console.log(`  ✓ Success`);

                        results.push({
                            localPath: file.localPath,
                            remotePath,
                            status: 'ok'
                        });
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        outputChannel.appendLine(`  ✗ Error: ${errorMessage}`);
                        console.error(`  ✗ Error: ${errorMessage}`);

                        results.push({
                            localPath: file.localPath,
                            remotePath,
                            status: 'error',
                            message: errorMessage
                        });
                    }

                    outputChannel.appendLine('');
                    uploaded++;
                }

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                outputChannel.appendLine(`FATAL ERROR: ${errorMessage}`);
                console.error(`Fatal error: ${errorMessage}`);
                vscode.window.showErrorMessage(`SSH upload failed: ${errorMessage}`);
                return;
            } finally {
                // Clean up connection
                if (client) {
                    client.end();
                    outputChannel.appendLine('SSH connection closed');
                }
            }

            // Summary
            const okCount = results.filter(r => r.status === 'ok').length;
            const errorCount = results.filter(r => r.status === 'error').length;
            const skippedCount = results.filter(r => r.status === 'skipped').length;

            outputChannel.appendLine('='.repeat(60));
            outputChannel.appendLine('UPLOAD SUMMARY');
            outputChannel.appendLine('='.repeat(60));
            outputChannel.appendLine(`Total files:   ${openFiles.length}`);
            outputChannel.appendLine(`Uploaded:      ${okCount}`);
            outputChannel.appendLine(`Failed:        ${errorCount}`);
            outputChannel.appendLine(`Skipped:       ${skippedCount}`);
            outputChannel.appendLine('='.repeat(60));

            console.log(`Upload complete: ${okCount} ok, ${errorCount} failed, ${skippedCount} skipped`);

            if (errorCount > 0) {
                vscode.window.showWarningMessage(
                    `Upload completed with errors: ${okCount} succeeded, ${errorCount} failed`
                );
            } else {
                vscode.window.showInformationMessage(
                    `Successfully uploaded ${okCount} file(s) to ${config.server}`
                );
            }
        }
    );
}
