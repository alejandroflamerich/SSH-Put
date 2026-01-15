# INSTRUCCIONES DE USO - SSH PUT EXTENSION

## ✅ PROYECTO COMPLETO Y LISTO

El proyecto está compilado y listo para ejecutar con F5.

````markdown
# INSTRUCCIONES DE USO - SSH PUT EXTENSION

## ✅ PROYECTO COMPLETO Y LISTO

El proyecto está compilado y listo para ejecutar con F5.

## 📁 Estructura del Proyecto

```
SSH/
├── .vscode/
│   ├── launch.json          # Configuración para F5 (Run Extension)
│   └── tasks.json           # Tarea de compilación
├── src/
│   └── extension.ts         # Código fuente TypeScript
├── out/
│   ├── extension.js         # Código compilado
│   └── extension.js.map     # Source map
├── node_modules/            # Dependencias instaladas
├── package.json             # Manifiesto de la extensión
├── tsconfig.json            # Configuración TypeScript
├── .eslintrc.json           # Configuración ESLint
├── .gitignore               # Archivos a ignorar en Git
├── .vscodeignore            # Archivos a ignorar en .vsix
└── README.md                # Documentación

```

## 🚀 CÓMO PROBAR LA EXTENSIÓN (ESPAÑOL)

### 1. Ejecutar en modo desarrollo (F5)

1. Abre esta carpeta en VS Code
2. Presiona **F5** o ve a Run > Start Debugging
3. Se abrirá una nueva ventana de VS Code con la extensión cargada
4. En la nueva ventana, presiona `Ctrl+Shift+P` y busca:
   - `SSH Put: Configure` - Para configurar la conexión
   - `SSH: Upload Open Files` - Para subir archivos

### 2. Configurar la conexión SSH

En la ventana de extensión (la que se abrió con F5):

1. Presiona `Ctrl+Shift+P`
2. Ejecuta: `SSH Put: Configure`
3. Ingresa los datos:
   - **Server**: `<your_server_or_ip>` (p. ej. `192.168.1.100`)
   - **Path**: `<your_remote_path>` (ruta remota base)
   - **User**: `<your_user>` (tu usuario SSH)
   - **Pass**: `<your_password>` (se mostrará con asteriscos)

Los datos se guardarán en `.vscode/settings.json` del workspace actual.

### 3. Subir archivos

1. Abre algunos archivos de tu proyecto en el editor
2. Presiona `Ctrl+Shift+P`
3. Ejecuta: `SSH: Upload Open Files`
4. Verás:
   - Una notificación de progreso mostrando `n/N` archivos
   - El Output Channel "SSH Put" con logs detallados
   - Mensaje de confirmación al terminar

## 📦 COMPILAR Y EMPAQUETAR

### Compilar manualmente

```powershell
npm run compile
```

### Watch mode (recompilación automática)

```powershell
npm run watch
```

### Empaquetar a .vsix

```powershell
npm run package
```

Esto generará un archivo `ssh-put-1.0.0.vsix` que puedes instalar con:

```powershell
code --install-extension ssh-put-1.0.0.vsix
```

## 🔍 CARACTERÍSTICAS IMPLEMENTADAS

✅ Comando `SSH: Upload Open Files` (id: `ssh.put`)
✅ Comando `SSH Put: Configure` (id: `ssh.configure`)
✅ Settings: `ssh.server`, `ssh.path`, `ssh.user`, `ssh.pass`
✅ Configuración mediante input boxes (password con masking)
✅ Solo sube archivos abiertos con scheme "file"
✅ Evita duplicados
✅ Auto-guarda archivos dirty antes de subir
✅ Mapeo de rutas relativas al workspace folder
✅ Ignora archivos fuera del workspace
✅ Conexión SSH/SFTP con librería `ssh2`
✅ Crea directorios remotos si no existen (mkdirp)
✅ Sobrescribe archivos siempre
✅ Output Channel "SSH Put" con logging detallado
✅ Console.log para debug
✅ Validación de config antes de ejecutar put
✅ Continúa con el resto si un archivo falla
✅ Progress notification con conteo n/N
✅ Resumen final: total, ok, failed, skipped
✅ No imprime password en logs
✅ TypeScript estricto
✅ Código bien comentado y con funciones separadas
✅ Scripts npm: compile, watch, package

## 🎯 FLUJO DE FUNCIONAMIENTO (ESPAÑOL)

1. **Configure** (primera vez):

   - Ejecutar `SSH Put: Configure`
   - Ingresar server, path, user, pass
   - Se guarda en workspace settings.json

2. **Upload**:
   - Abrir archivos en el editor
   - Ejecutar `SSH: Upload Open Files`
   - La extensión:
     a. Valida configuración
     b. Guarda archivos dirty
     c. Obtiene lista de archivos abiertos (scheme "file")
     d. Calcula rutas relativas al workspace
     e. Conecta por SSH
     f. Crea directorios remotos
     g. Sube cada archivo (continúa si falla uno)
     h. Muestra progreso y logs
     i. Cierra conexión
     j. Muestra resumen

## 📝 EJEMPLO DE SETTINGS.JSON

Después de ejecutar Configure, en `.vscode/settings.json`:

```json
{
  "ssh.server": "<your_server_or_ip>",
  "ssh.path": "<your_remote_path>",
  "ssh.user": "<your_user>",
  "ssh.pass": "<your_password>"
}
```

## 🔧 SOLUCIÓN DE PROBLEMAS (ESPAÑOL)

### Error: "SSH configuration is incomplete"

- Ejecuta `SSH Put: Configure` y completa todos los campos

### Error: "No workspace files are currently open"

- Abre al menos un archivo del workspace actual

### Error de conexión SSH

- Verifica que el servidor esté accesible
- Verifica credenciales
- Revisa el puerto (por defecto 22)

### Archivos no se suben

- Verifica que sean archivos reales en disco (no untitled)
- Verifica que pertenezcan al workspace folder

## 📚 DEPENDENCIAS PRINCIPALES

- `vscode`: API de VS Code
- `ssh2`: Cliente SSH/SFTP para Node.js
- `typescript`: Compilador TypeScript
- `@vscode/vsce`: Empaquetador de extensiones

---

## INSTRUCTIONS - SSH PUT EXTENSION (ENGLISH)

Below is a concise English translation of the usage instructions for users.

## ✅ PROJECT READY

The project is compiled and ready to run with F5.

## 📁 Project structure

```
SSH/
├── .vscode/
│   ├── launch.json          # Configuration for F5 (Run Extension)
│   └── tasks.json           # Build task
├── src/
│   └── extension.ts         # TypeScript source
├── out/
│   ├── extension.js         # Compiled code
│   └── extension.js.map     # Source map
├── node_modules/            # Installed dependencies
├── package.json             # Extension manifest
├── tsconfig.json            # TypeScript config
├── .eslintrc.json           # ESLint config
├── .gitignore               # Git ignore
├── .vscodeignore            # VSIX ignore
└── README.md                # Documentation

```

## 🚀 How to try the extension (ENGLISH)

### 1. Run in development (F5)

1. Open this folder in VS Code
2. Press **F5** or go to Run > Start Debugging
3. A new VS Code window will open with the extension loaded
4. In the new window press `Ctrl+Shift+P` and run:
   - `SSH Put: Configure` - to configure the connection
   - `SSH: Upload Open Files` - to upload files

### 2. Configure SSH connection

In the extension window (the one opened with F5):

1. Press `Ctrl+Shift+P`
2. Run: `SSH Put: Configure`
3. Enter the values:
   - **Server**: `<your_server_or_ip>` (e.g. `192.168.1.100`)
   - **Path**: `<your_remote_path>` (remote base path)
   - **User**: `<your_user>` (your SSH user)
   - **Pass**: `<your_password>` (masked input)

Values are saved to the workspace `.vscode/settings.json` file.

### 3. Upload files

1. Open some files from your project in the editor
2. Press `Ctrl+Shift+P`
3. Run: `SSH: Upload Open Files`
4. You will see:
   - A progress notification showing `n/N` files
   - The "SSH Put" Output Channel with detailed logs
   - A completion message when finished

## 📦 Build and package

### Build

```powershell
npm run compile
```

### Watch mode

```powershell
npm run watch
```

### Package to .vsix

```powershell
npm run package
```

Install the VSIX locally with:

```powershell
code --install-extension ssh-put-1.0.0.vsix
```

## 🔍 Implemented features

- `SSH: Upload Open Files` (id: `ssh.put`)
- `SSH Put: Configure` (id: `ssh.configure`)
- Settings: `ssh.server`, `ssh.path`, `ssh.user`, `ssh.pass`
- Configure using input boxes (password masked)
- Only uploads files with scheme `file`
- Avoids duplicates
- Auto-saves dirty files before upload
- Maps relative paths to workspace folder
- Ignores files outside workspace
- SSH/SFTP connection using `ssh2`
- Creates remote directories if missing (mkdirp)
- Overwrites files
- Output Channel "SSH Put" with detailed logging
- Console.log for debugging
- Config validation before upload
- Continues on individual file errors
- Progress notification with n/N count
- Final summary: total, ok, failed, skipped
- Does not print password in logs
- TypeScript strict
- Cleanly commented, modular code

## 🔧 Troubleshooting (ENGLISH)

### Error: "SSH configuration is incomplete"

- Run `SSH Put: Configure` and complete all fields

### Error: "No workspace files are currently open"

- Open at least one file from the current workspace

### SSH connection errors

- Verify the server is reachable
- Verify credentials
- Check port (default 22)

### Files not uploading

- Ensure files are real disk files (not untitled)
- Ensure files belong to the workspace folder

## 📚 Main dependencies

- `vscode`: VS Code API
- `ssh2`: SSH/SFTP client for Node.js
- `typescript`: TypeScript compiler
- `@vscode/vsce`: VS Code packaging tool

## 🔐 Security

⚠️ IMPORTANT: Passwords are stored in plain text in settings.json

To improve security:

- Don't share your settings.json
- Consider using SSH keys instead of passwords
- Use .gitignore to exclude settings.json

---

**Developed as a complete VS Code extension project in TypeScript**
````
