# Connect to Azure VM from Cursor

## Quick Connection

### Step 1: Set PEM File Permissions (Windows)

On Windows, you need to set proper permissions for the PEM file:

**Using PowerShell (Run as Administrator):**
```powershell
# Navigate to where your PEM file is
cd C:\path\to\your\pem\file

# Remove inheritance and set permissions
icacls your-key.pem /inheritance:r
icacls your-key.pem /grant:r "$env:USERNAME:R"
```

**Or using Git Bash / WSL:**
```bash
chmod 400 your-key.pem
```

### Step 2: Connect via SSH

**In Cursor Terminal (use Git Bash or WSL if on Windows):**

```bash
ssh -i /path/to/your-key.pem azureuser@<VM_IP_ADDRESS>
```

**Example:**
```bash
ssh -i C:\Users\YourName\Downloads\my-key.pem azureuser@20.123.45.67
```

## Using Cursor's Integrated Terminal

### Option 1: Direct SSH Command

1. **Open Terminal in Cursor**: `Ctrl + `` (backtick) or `Terminal → New Terminal`
2. **Run SSH command:**
   ```bash
   ssh -i "C:\path\to\your-key.pem" azureuser@<VM_IP>
   ```

### Option 2: Use WSL (Recommended for Windows)

If you have WSL installed:

1. **Open WSL terminal in Cursor**
2. **Copy PEM file to WSL:**
   ```bash
   cp /mnt/c/Users/YourName/Downloads/your-key.pem ~/.ssh/
   chmod 400 ~/.ssh/your-key.pem
   ```
3. **Connect:**
   ```bash
   ssh -i ~/.ssh/your-key.pem azureuser@<VM_IP>
   ```

### Option 3: Use Git Bash

1. **Open Git Bash terminal in Cursor**
2. **Navigate to PEM file location:**
   ```bash
   cd /c/Users/YourName/Downloads
   chmod 400 your-key.pem
   ```
3. **Connect:**
   ```bash
   ssh -i your-key.pem azureuser@<VM_IP>
   ```

## Set Up SSH Config (Easier Future Connections)

Create/edit SSH config file for easier connections:

### On Windows (WSL/Git Bash):

```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Edit config file
nano ~/.ssh/config
```

**Add this configuration:**
```
Host ammas-vm
    HostName <VM_IP_ADDRESS>
    User azureuser
    IdentityFile ~/.ssh/your-key.pem
    StrictHostKeyChecking no
```

**Save and set permissions:**
```bash
chmod 600 ~/.ssh/config
chmod 400 ~/.ssh/your-key.pem
```

**Now you can connect simply:**
```bash
ssh ammas-vm
```

### On Windows (PowerShell):

Create config file at: `C:\Users\YourName\.ssh\config`

```
Host ammas-vm
    HostName <VM_IP_ADDRESS>
    User azureuser
    IdentityFile C:\Users\YourName\.ssh\your-key.pem
    StrictHostKeyChecking no
```

## Common Issues & Solutions

### Issue 1: "Permissions are too open"

**Error:**
```
Permissions 0644 for 'your-key.pem' are too open.
It is required that your private key files are NOT accessible by others.
```

**Solution:**
```bash
# Windows (PowerShell as Admin)
icacls your-key.pem /inheritance:r
icacls your-key.pem /grant:r "$env:USERNAME:R"

# Or in Git Bash/WSL
chmod 400 your-key.pem
```

### Issue 2: "Connection refused" or "Connection timed out"

**Check:**
1. VM is running in Azure Portal
2. Network Security Group allows SSH (port 22)
3. Correct IP address

**Fix NSG:**
```bash
az vm open-port --port 22 --resource-group ammas-food-rg --name ammas-food-vm
```

### Issue 3: "Permission denied (publickey)"

**Solutions:**
1. Verify username is correct (usually `azureuser` or what you set)
2. Check PEM file path is correct
3. Verify key was added to VM during creation

**Try with verbose output:**
```bash
ssh -v -i your-key.pem azureuser@<VM_IP>
```

### Issue 4: "Bad permissions" on Windows

**Use icacls:**
```powershell
# Remove all permissions
icacls your-key.pem /inheritance:r

# Grant read-only to current user
icacls your-key.pem /grant:r "$env:USERNAME:R"

# Verify
icacls your-key.pem
```

## Quick Commands Reference

### Get VM IP Address
```bash
az vm show \
  --resource-group ammas-food-rg \
  --name ammas-food-vm \
  --show-details \
  --query publicIps \
  --output tsv
```

### Connect with Specific Username
```bash
ssh -i your-key.pem <username>@<VM_IP>
```

### Connect with Port (if changed)
```bash
ssh -i your-key.pem -p 2222 azureuser@<VM_IP>
```

### Copy Files to VM (SCP)
```bash
# Copy file to VM
scp -i your-key.pem local-file.txt azureuser@<VM_IP>:/home/azureuser/

# Copy directory to VM
scp -i your-key.pem -r local-directory azureuser@<VM_IP>:/home/azureuser/
```

### Copy Files from VM
```bash
# Copy file from VM
scp -i your-key.pem azureuser@<VM_IP>:/path/to/file.txt ./

# Copy directory from VM
scp -i your-key.pem -r azureuser@<VM_IP>:/path/to/directory ./
```

## Using Cursor's Remote SSH Extension

### Option: Install Remote-SSH Extension

1. **Install Extension:**
   - Open Extensions in Cursor (`Ctrl+Shift+X`)
   - Search for "Remote - SSH"
   - Install it

2. **Connect:**
   - Press `F1` or `Ctrl+Shift+P`
   - Type "Remote-SSH: Connect to Host"
   - Enter: `azureuser@<VM_IP>`
   - Select your PEM file when prompted

3. **Or add to SSH config:**
   - Edit `~/.ssh/config` (or `C:\Users\YourName\.ssh\config`)
   - Add VM configuration
   - Connect via Command Palette

## Step-by-Step: First Connection

1. **Open Cursor Terminal** (`Ctrl + ``)

2. **Navigate to PEM file location:**
   ```bash
   cd C:\Users\YourName\Downloads
   ```

3. **Set permissions (if using Git Bash/WSL):**
   ```bash
   chmod 400 your-key.pem
   ```

4. **Connect:**
   ```bash
   ssh -i your-key.pem azureuser@<VM_IP>
   ```

5. **First time connection - type "yes" when prompted:**
   ```
   The authenticity of host '20.123.45.67' can't be established.
   Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
   ```

6. **You're connected!** 🎉

## After Connecting

Once connected, you can:

1. **Run the deployment script:**
   ```bash
   # Upload deploy.sh first (from your local machine)
   scp -i your-key.pem deploy.sh azureuser@<VM_IP>:/home/azureuser/
   
   # Then on VM
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. **Or clone directly:**
   ```bash
   git clone https://github.com/abhinavjha98/ammas-food.git
   cd ammas-food
   chmod +x deploy.sh
   ./deploy.sh
   ```

## Pro Tips

1. **Use SSH config** - Makes future connections easier
2. **Use WSL** - Better SSH experience on Windows
3. **Set up key forwarding** - For accessing GitHub from VM:
   ```bash
   ssh -i your-key.pem -A azureuser@<VM_IP>
   ```
4. **Use VS Code Remote** - Can edit files directly on VM
5. **Keep PEM file secure** - Never commit to Git!

---

**You're all set! Connect and deploy! 🚀**
