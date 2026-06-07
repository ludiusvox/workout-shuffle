# Setting Up Android Release Signing

To use the automated Android Release workflow, you need to set up several secrets in your GitHub repository.

## 1. Generate a Keystore
If you don't have one, generate a keystore file:
```bash
keytool -genkey -v -keystore my-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key-alias
```

## 2. Encode the Keystore to Base64
GitHub Secrets only store text. Encode your `.jks` file:
- **macOS/Linux:** `base64 -i my-release-key.jks`
- **Windows (PowerShell):** `[Convert]::ToBase64String([IO.File]::ReadAllBytes("my-release-key.jks"))`

## 3. Add Secrets to GitHub
Go to your repo on GitHub: **Settings > Secrets and variables > Actions > New repository secret**.

Add the following secrets:

| Secret Name | Description |
| ----------- | ----------- |
| `SIGNING_KEY` | The Base64 string of your keystore file. |
| `ALIAS` | The alias you chose when generating the key (e.g., `my-key-alias`). |
| `KEY_STORE_PASSWORD` | The password for your keystore. |
| `KEY_PASSWORD` | The password for your key (often the same as the keystore password). |

## 4. How to Trigger a Release
The workflow is triggered by:
1. **Pushing a tag:** `git tag v1.0.0 && git push origin v1.0.0`
2. **Manually:** Go to the **Actions** tab, select **Android Release**, and click **Run workflow**.

The signed APK will be automatically attached to a new GitHub Release.
