# SSH Config File Setup

## Your SSH Config Entry

Your SSH config file is located at:
```
C:\Users\abhin\.ssh\config
```

## What Was Added

The following entry was added to your SSH config:

```
Host ammas-vm
    HostName 172.171.241.8
    User azureuser
    IdentityFile C:\Users\abhin\Downloads\ammas-food_key.pem
    StrictHostKeyChecking no
    UserKnownHostsFile C:\Users\abhin\.ssh\known_hosts
```

## How to Use

Now you can connect simply by typing:
```bash
ssh ammas-vm
```

Instead of:
```bash
ssh -i "C:\Users\abhin\Downloads\ammas-food_key.pem" azureuser@172.171.241.8
```

## Manual Edit (If Needed)

If you want to edit the config file manually:

1. **Open the file:**
   ```
   C:\Users\abhin\.ssh\config
   ```

2. **Add or edit the entry:**
   ```
   Host ammas-vm
       HostName 172.171.241.8
       User azureuser
       IdentityFile C:\Users\abhin\Downloads\ammas-food_key.pem
       StrictHostKeyChecking no
   ```

3. **Save the file**

## Using in Cursor

### Option 1: Direct SSH Command
```bash
ssh ammas-vm
```

### Option 2: Using Git Bash/WSL
If using Git Bash or WSL, you might need to use the Windows path format or copy the PEM file:

```bash
# In Git Bash/WSL, you can use:
ssh -i /c/Users/abhin/Downloads/ammas-food_key.pem azureuser@172.171.241.8
```

Or set up WSL SSH config at `~/.ssh/config`:
```
Host ammas-vm
    HostName 172.171.241.8
    User azureuser
    IdentityFile /mnt/c/Users/abhin/Downloads/ammas-food_key.pem
    StrictHostKeyChecking no
```

## Verify Connection

Test the connection:
```bash
ssh ammas-vm
```

If it works, you'll see:
```
Welcome to Ubuntu...
azureuser@ammas-food-vm:~$
```

## Troubleshooting

### "Bad permissions" error
Run in PowerShell (as Admin):
```powershell
icacls "C:\Users\abhin\Downloads\ammas-food_key.pem" /inheritance:r
icacls "C:\Users\abhin\Downloads\ammas-food_key.pem" /grant "${env:USERNAME}:(R)"
```

### "Host key verification failed"
Remove the old host key:
```bash
ssh-keygen -R 172.171.241.8
```

### Config not working in Git Bash/WSL
The Windows SSH config might not work in Git Bash/WSL. Create a separate config:
```bash
# In Git Bash/WSL
nano ~/.ssh/config
```

Add:
```
Host ammas-vm
    HostName 172.171.241.8
    User azureuser
    IdentityFile /mnt/c/Users/abhin/Downloads/ammas-food_key.pem
    StrictHostKeyChecking no
```

---

**You're all set! Just type `ssh ammas-vm` to connect! 🚀**
