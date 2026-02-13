# Placeholderi Disponibili în MDT

## Generale
- `{nume}` → Nume suspect
- `{cnp}` → CNP suspect
- `{sex_suspect}` → Sex suspect
- `{suspect_complice}` → Suspect complice
- `{nume_victima}` → Nume parte vătămată
- `{cnp_victima}` → CNP parte vătămată
- `{sex_victima}` → Sex victimă
- `{victima_politie}` → Victimă poliție
- `{locatie}` → Locația
- `{data_ora}` → Data și ora
- `{data}` → Data
- `{ora}` → Ora
- `{viteza}` → Viteză înregistrată
- `{limita}` → Limita viteză
- `{patrula}` → Patrula

## Vehicul
- `{tip_vehicul}` → Tip vehicul
- `{tip_vehicul_procesator}` → Tip vehicul (compatibilitate BD)
- `{model_vehicul}` → Model vehicul
- `{model_vehicul_input}` → Model vehicul (compatibilitate BD)
- `{culoare_vehicul}` → Culoare vehicul
- `{numere_inmatriculare}` → Numere înmatriculare
- `{nr_inmatriculare}` → Numere înmatriculare (compatibilitate BD)
- `{autospeciala}` → Autospecială

## Constatare
- `{tip_constatare}` → Tip constatare
- `{substanta}` → Substanță sub influență
- `{tip_substanta}` → Tip substanță
- `{rezultat_test}` → Rezultat test
- `{perchezitie}` → Percheziție
- `{buzunare}` → Buzunare
- `{buzunare_text}` → Text buzunare
- `{buzunare_continut}` → Conținut buzunare
- `{torpedo}` → Torpedo
- `{torpedo_text}` → Text torpedo
- `{torpedo_continut}` → Conținut torpedo
- `{portbagaj}` → Portbagaj
- `{portbagaj_text}` → Text portbagaj
- `{portbagaj_continut}` → Conținut portbagaj
- `{crima_organizata}` → Crimă organizată
- `{tigari_contrabanda}` -> Țigări contrabandă
- `{droguri_risc}` → Droguri risc
- `{droguri_risc_cantitate}` → Cantitate droguri risc
- `{droguri_mare_risc}` → Droguri mare risc
- `{droguri_mare_risc_cantitate}` → Cantitate droguri mare risc
- `{bani_murdari}` → Bani murdari
- `{licente}` -> Licențe
- `{licente_checkbox}` → Checkbox licențe
- `{lipsa_licenta1}` → Lipsă licență 1
- `{lipsa_licenta2}` → Lipsă licență 2

## Sancțiuni
- `{amenda_totala}` → Amendă totală
- `{amenda}` → Amendă manuală
- `{arest_total}` → Arest total
- `{arest}` → Arest manual
- `{puncte_permis}` → Puncte permis
- `{puncte}` → Puncte (alias)
- `{anulare_permis}` → Anulare permis
- `{dosar_penal}` → Dosar penal
- `{ridicare_vehicul}` → Ridicare vehicul
- `{locatie_detentie}` → Locație detenție

## Descriere Caz
- `{titlu_caz}` → Titlu caz
- `{descriere_caz}` → Descriere caz

## Incadrare
- `{infractiune1}` → Infracțiune 1
- `{previzualizare1}` → Previzualizare 1
- `{mentiuni1}` → Mențiuni 1
- `{infractiune2}` → Infracțiune 2
- `{previzualizare2}` → Previzualizare 2
- `{mentiuni2}` → Mențiuni 2
- `{infractiune3}` → Infracțiune 3
- `{previzualizare3}` → Previzualizare 3
- `{mentiuni3}` → Mențiuni 3

## Placeholderi Speciali (din Baza de Date)
- `{nr_inmatriculare}` → Placeholder special pentru numere de înmatriculare (cu logică custom)
- `{viteza_inregistrata}` → Viteză înregistrată (compatibilitate BD)
- `{limita_viteza_zona}` → Limita viteză zonă (mapat la limitaViteza)

## Placeholderi pentru Compatibilitate (Legacy)
Acești placeholderi sunt folosiți în descrierile din baza de date și sunt mapați la câmpurile corespunzătoare:
- `{tip_vehicul_procesator}` → `tipVehicul`
- `{model_vehicul_input}` → `modelVehicul`
- `{viteza_inregistrata}` → `vitezaInregistrata`
- `{limita_viteza_zona}` → `limitaViteza`

## Exemple Utilizare

### Exemplu 1: Folosirea telefonului
```
cetățeanul {nume} (CNP {cnp}) conducea {tip_vehicul}, marca {model_vehicul} de culoare {culoare_vehicul}, {nr_inmatriculare}, folosind telefonul mobil în timpul condusului.
```

### Exemplu 2: Limită de viteză (din BD)
```
cetățeanul {nume} (CNP {cnp}) a fost înregistrat de aparatul radar al echipajului de poliție conducând {tip_vehicul_procesator}, marca {model_vehicul_input} de culoare {culoare_vehicul}, {nr_inmatriculare}, cu viteza de {viteza_inregistrata} km/h, unde în zona respectivă limita de viteză este de {limita_viteza_zona} km/h.
```

## Note
- Toți placeholderii sunt case-sensitive
- Placeholderii necompletați apar în roșu bold
- Datele complete apar în verde bold
- Previzualizările se actualizează instantaneu la modificarea câmpurilor
- Placeholderii legacy din BD sunt automați mapați la câmpurile curente pentru compatibilitate
