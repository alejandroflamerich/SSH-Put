# SSH Put - Upload Open Files

Extensión de VS Code que permite subir archivos abiertos a un servidor remoto vía SSH/SFTP.

> Nota: Instrucciones completas en Español / English en el archivo `INSTRUCCIONES.md`.
> Ver: [INSTRUCCIONES.md](INSTRUCCIONES.md)

## Características

- **Upload selectivo**: Sube solo los archivos que están actualmente abiertos en el editor
- **Configuración sencilla**: Configura servidor, ruta, usuario y contraseña mediante comandos
- **Logging detallado**: Output channel con información de cada archivo subido
- **Manejo de errores**: Continúa subiendo archivos aunque alguno falle
- **Progress notification**: Muestra el progreso de la subida en tiempo real
- **Auto-save**: Guarda automáticamente archivos modificados antes de subir

## Comandos

### SSH: Upload Open Files

**Command ID**: `ssh.put`

Sube todos los archivos abiertos en el editor al servidor remoto configurado.

### SSH Put: Configure

**Command ID**: `ssh.configure`

Abre un asistente de configuración para establecer los parámetros de conexión SSH.

## Comandos principales / Main commands

- **SSH: Upload Open Files** — `ssh.put` — Sube todos los archivos abiertos en el editor. / Uploads all currently open files in the editor.
- **SSH Put: Configure** — `ssh.configure` — Abre el asistente de configuración SSH. / Opens the SSH configuration assistant.
- **SSH Put: About** — `ssh.about` — Muestra una notificación con la atribución: "Desarrollado por Alejandro Flamerich". / Shows a notification with the attribution: "Developed by Alejandro Flamerich".

## Configuración

La extensión utiliza los siguientes parámetros en `settings.json`:

```json
{
  "ssh.server": "<your_server_or_ip>",
  "ssh.path": "<your_remote_path>",
  "ssh.user": "<your_user>",
  "ssh.pass": "<your_password>"
}
```

### Parámetros

- **ssh.server**: Hostname o dirección IP del servidor SSH
- **ssh.path**: Ruta base remota donde se subirán los archivos
- **ssh.user**: Nombre de usuario SSH
- **ssh.pass**: Contraseña SSH (almacenada en settings)

## Uso

1. Presiona `Ctrl+Shift+P` (Windows/Linux) o `Cmd+Shift+P` (Mac)
2. Ejecuta el comando `SSH Put: Configure` para configurar la conexión
3. Abre los archivos que deseas subir
4. Ejecuta el comando `SSH: Upload Open Files`
5. Los archivos se subirán manteniendo su estructura de carpetas relativa al workspace

## Compilar y Ejecutar

### Instalación de dependencias

```bash
npm install
```

### Compilar

```bash
npm run compile
```

### Ejecutar en modo desarrollo

Presiona `F5` en VS Code para abrir una nueva ventana con la extensión cargada.

### Watch mode (recompilación automática)

```bash
npm run watch
```

### Empaquetar a .vsix

```bash
npm run package
```

## Requisitos

- VS Code 1.75.0 o superior
- Node.js 18.x o superior
- Servidor SSH con acceso SFTP

## Notas de seguridad

⚠️ **Importante**: La contraseña se almacena en texto plano en `settings.json`. Para mayor seguridad, considera:

- Usar autenticación por clave SSH
- No compartir tu archivo `settings.json`
- Usar variables de entorno o secretos del workspace

## Licencia

MIT

## Autor

Alejandro Flamerich
