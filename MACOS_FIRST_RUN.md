# Opening Keyword Workbench on macOS

## Why macOS shows a warning

`Start Keyword Workbench.command` is a small launcher script included with this open-source project. Because it was downloaded from the internet and is not signed and notarised with an Apple Developer ID, macOS Gatekeeper may block it the first time you open it.

This does not mean macOS found malware. It means Apple cannot verify the identity of the developer who distributed the file.

## Recommended first-run steps

1. In Finder, Control-click `Start Keyword Workbench.command` and choose **Open**.
2. If macOS offers an **Open** button, select it.
3. If the message only offers **Done** or **Move to Bin**, choose **Done**. Do not move the launcher to the Bin.
4. Open **System Settings** and select **Privacy & Security**.
5. Scroll to the **Security** section. You should see a message that `Start Keyword Workbench.command` was blocked.
6. Select **Open Anyway**.
7. Confirm with your Mac password or Touch ID, then select **Open**.

You normally need to complete this approval only once for the downloaded launcher.

## Terminal fallback

If **Open Anyway** does not appear, you can remove the quarantine flag from this launcher only:

1. Open the Terminal application.
2. Type the following command, including the space at the end, but do not press Return yet:

   ```bash
   xattr -d com.apple.quarantine 
   ```

3. Drag `Start Keyword Workbench.command` from Finder into the Terminal window. Terminal adds the full file path automatically.
4. Press Return, then double-click the launcher again.

Do not disable Gatekeeper globally. The command above removes quarantine only from the selected Keyword Workbench launcher.

## Inspecting the launcher

The launcher is plain text. You can inspect it before opening by Control-clicking the file, choosing **Open With**, and selecting a text editor. The same source is available in the public GitHub repository.

## Warning-free distribution

A warning-free double-click experience requires a macOS application signed with an Apple Developer ID and submitted to Apple for notarisation. The open-source `.command` launcher cannot provide the same identity verification on its own.
