; Police Helper Enhanced - Custom NSIS Script
; Instalare complet automată în Program Files

!macro customInstall
  ; Creează structura de directoare pentru sistemul de actualizare
  CreateDirectory "$INSTDIR\versions"
  
  ; Copiază executabilele de actualizare
  CopyFiles "$INSTDIR\PoliceHelperEnhanced.exe" "$INSTDIR\PoliceHelperEnhanced.exe"
  CopyFiles "$INSTDIR\PoliceUpdater.exe" "$INSTDIR\PoliceUpdater.exe"
  
  ; Creează active.json
  FileOpen $0 "$INSTDIR\active.json" w
  FileWrite $0 '{"activeVersion":"$INSTVERSION","previousVersion":null}'
  FileClose $0
  
  ; Creează folder versiune curentă
  CreateDirectory "$INSTDIR\versions\$INSTVERSION"
  CopyFiles "$INSTDIR\Police Helper Enhanced.exe" "$INSTDIR\versions\$INSTVERSION\app.exe"
  
  ; Setează permisiuni admin
  Exec 'icacls "$INSTDIR" /grant "Users:(OI)(CI)F" /T'
!macroend

!macro customUnInstall
  ; Șterge toate versiunile
  RMDir /r "$INSTDIR\versions"
  
  ; Șterge fișierele de sistem
  Delete "$INSTDIR\active.json"
  Delete "$INSTDIR\PoliceHelperEnhanced.exe"
  Delete "$INSTDIR\PoliceUpdater.exe"
!macroend
