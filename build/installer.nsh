; Custom NSIS script for Police Helper Enhanced Portable Installation

!macro customInstall
  ; Create installation directory
  CreateDirectory "$INSTDIR"
  
  ; Copy all application files
  CopyFiles "$EXEDIR\*" "$INSTDIR" 0
  
  ; Create desktop shortcut (without icon for now)
  CreateShortCut "$DESKTOP\Police Helper Enhanced.lnk" "$INSTDIR\Police Helper Enhanced.exe" "" "" 0 SW_SHOWNORMAL
  
  ; Create start menu shortcut (without icon for now)
  CreateDirectory "$SMPROGRAMS\Police Helper Enhanced"
  CreateShortCut "$SMPROGRAMS\Police Helper Enhanced\Police Helper Enhanced.lnk" "$INSTDIR\Police Helper Enhanced.exe" "" "" 0 SW_SHOWNORMAL
  
  ; Write registry entries for auto-update
  WriteRegStr HKLM "Software\Police Helper Enhanced" "InstallPath" "$INSTDIR"
  WriteRegStr HKLM "Software\Police Helper Enhanced" "Version" "${VERSION}"
  WriteRegStr HKLM "Software\Police Helper Enhanced" "IsPortable" "true"
  
  ; Mark as installed
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Police Helper Enhanced" "DisplayName" "Police Helper Enhanced"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Police Helper Enhanced" "UninstallString" "$INSTDIR\uninstall.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Police Helper Enhanced" "InstallLocation" "$INSTDIR"
!macroend

!macro customUnInstall
  ; Remove shortcuts
  Delete "$DESKTOP\Police Helper Enhanced.lnk"
  Delete "$SMPROGRAMS\Police Helper Enhanced\Police Helper Enhanced.lnk"
  RMDir "$SMPROGRAMS\Police Helper Enhanced"
  
  ; Remove registry entries
  DeleteRegKey HKLM "Software\Police Helper Enhanced"
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\Police Helper Enhanced"
  
  ; Remove application files (ask user first)
  MessageBox MB_YESNO "Doriți să ștergeți toate fișierele aplicației din $INSTDIR?" IDYES remove_files IDNO skip_removal
  
  remove_files:
    RMDir /r "$INSTDIR"
  
  skip_removal:
!macroend

; Section definitions
Section "MainSection" SEC01
  !insertmacro customInstall
SectionEnd

Section "Uninstall"
  !insertmacro customUnInstall
SectionEnd
