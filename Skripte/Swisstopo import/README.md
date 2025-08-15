# Swisstopo Grid Height Generator for Cyclone 3DR

## Description / Beschreibung

**English:**
This script generates a grid of height points within a closed polygon boundary using official height data from swisstopo (Swiss Federal Office of Topography). The script retrieves precise elevation data through swisstopo's REST API and creates a point cloud in Leica Cyclone 3DR.

**Deutsch:**
Dieses Skript erzeugt ein Raster von Höhenpunkten innerhalb einer geschlossenen Polygongrenze unter Verwendung offizieller Höhendaten von swisstopo (Bundesamt für Landestopografie). Das Skript ruft präzise Höhendaten über die REST-API von swisstopo ab und erstellt eine Punktwolke in Leica Cyclone 3DR.

## Features

- ✅ Grid point generation within polygon boundaries / Rasterpunktgenerierung innerhalb von Polygongrenzen
- ✅ Real-time height data from swisstopo API / Echtzeitdaten von der swisstopo-API
- ✅ LV95 coordinate system support (EPSG:2056) / Unterstützung des LV95-Koordinatensystems
- ✅ Customizable grid spacing / Anpassbarer Rasterabstand
- ✅ Progress monitoring and error handling / Fortschrittsüberwachung und Fehlerbehandlung
- ✅ Bilingual interface (EN/DE) / Zweisprachige Benutzeroberfläche

## Requirements

### Software
- **Leica Cyclone 3DR** (any recent version)
- **curl** command-line tool (must be available in system PATH)
  - Windows: Usually pre-installed with Windows 10/11
  - Alternative: Download from https://curl.se/download.html

### System Requirements
- Internet connection for swisstopo API access
- Valid LV95 coordinates within Swiss territory
- Minimum 1MB free disk space for temporary files

### Koordinatensystem
- **LV95 (EPSG:2056)** - Swiss national coordinate system
- Coverage area: Switzerland and Liechtenstein

## Installation

1. **Download the script file** `GridHeightFromSwisstopo.js`
2. **Place it in your Cyclone 3DR scripts directory**, typically:
   - `C:\Users\[Username]\Documents\3DReshaper Scripts\`
   - Or any custom script directory configured in Cyclone 3DR

## Usage

### Step-by-Step Instructions

1. **Prepare your polygon**
   - Create or import a **closed polyline** in Cyclone 3DR
   - Ensure coordinates are in **LV95 system (EPSG:2056)**
   - The polygon should define the boundary area for height points

2. **Select the polygon**
   - Select the closed polyline in the 3D view
   - Only **one closed polyline** should be selected

3. **Run the script**
   - Go to: `Tools` → `Execute Script` → Select `GridHeightFromSwisstopo.js`
   - Or use the script manager if configured

4. **Configure parameters**
   - **Grid spacing**: Distance between points in meters (recommended: 1-10m)
   - Smaller values = higher density = more API calls = longer processing time

5. **Wait for completion**
   - The script will show progress in the console
   - Processing time depends on area size and grid spacing

6. **Review results**
   - A new point cloud will be created: `Swisstopo_Grid_Heights_[spacing]m`
   - Check the success rate in the completion dialog

### Example Use Cases

- **Terrain modeling** for construction sites
- **Elevation analysis** for planning projects
- **Reference height data** for survey validation
- **Topographic studies** 

## Parameters

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| Grid Spacing | 0.1 - 100.0 m | 2.0 m | Distance between grid points |

### Grid Spacing Recommendations

- **0.5 - 1.0m**: High detail, small areas, long processing time
- **2.0 - 5.0m**: Standard detail, medium areas, moderate processing time  
- **10.0m+**: Low detail, large areas, fast processing time

## API Information

### swisstopo REST API
- **Endpoint**: `https://api3.geo.admin.ch/rest/services/height`
- **Coordinate System**: LV95 (EPSG:2056)
- **Data Source**: DTM-AV (Digital Terrain Model)
- **Accuracy**: Sub-meter precision
- **Coverage**: Switzerland and Liechtenstein

### Fair Use Policy

According to swisstopo's terms of use:

**English:**
- ✅ **Free use** for non-commercial and commercial purposes
- ✅ **No registration required** for standard API usage
- ✅ **Attribution required**: Must credit swisstopo as data source
- ⚠️ **Rate limits**: Reasonable use expected (avoid excessive automated queries)
- ⚠️ **Service availability**: No guaranteed uptime, service may be temporarily unavailable

**Deutsch:**
- ✅ **Kostenlose Nutzung** für nicht-kommerzielle und kommerzielle Zwecke
- ✅ **Keine Registrierung erforderlich** für Standard-API-Nutzung
- ✅ **Quellenangabe erforderlich**: swisstopo muss als Datenquelle genannt werden
- ⚠️ **Nutzungsebeschränkungen**: Angemessene Nutzung erwartet (übermäßige automatisierte Abfragen vermeiden)
- ⚠️ **Serviceverfügbarkeit**: Keine garantierte Betriebszeit, Service kann temporär nicht verfügbar sein

### Data Attribution

**Required attribution**
```
© swisstopo - Swiss Federal Office of Topography
Height data from api3.geo.admin.ch
```

## Troubleshooting

### Common Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| "curl command not found" | curl not installed/configured | Install curl or add to system PATH |
| "No points generated" | Polygon outside Switzerland | Verify LV95 coordinates are valid |
| "API request failed" | No internet connection | Check network connectivity |
| High failure rate | API temporarily unavailable | Try again later or reduce grid density |
| Script execution error | Wrong polyline selection | Select exactly one closed polyline |

### Network Configuration

If running behind a corporate firewall:
- Ensure HTTPS access to `api3.geo.admin.ch` is allowed
- Configure proxy settings for curl if needed
- Contact IT department if API access is blocked

## Performance 

### Processing Time Examples

| Area | Grid Spacing | Estimated Points | Processing Time |
|------|--------------|------------------|-----------------|
| 100m × 100m | 2m | ~2,500 points | 2-5 minutes |
| 500m × 500m | 5m | ~10,000 points | 5-15 minutes |
| 1km × 1km | 10m | ~10,000 points | 5-15 minutes |

*Times may vary based on internet speed and API response time*

## Technical Details

### Coordinate System
- **Input**: LV95 (EPSG:2056)
- **API**: LV95 Easting/Northing
- **Output**: 3D points with LV95 X,Y and ellipsoidal heights

### Height Reference
- **Datum**: LN02 (Swiss national height system)
- **Type**: Ellipsoidal heights above sea level
- **Precision**: Typically ±0.1 to ±0.5 meters

## Version History

- **v1.6**: Enhanced documentation, bilingual interface, improved error handling
- **v1.5**: Fixed SCloud API usage, improved coordinate handling
- **v1.4**: Added progress monitoring and success rate reporting
- **v1.3**: Initial stable release

## License

This script is provided as-is for use with Leica Cyclone 3DR. 

**Data License:**
Height data is provided by swisstopo under their open data policy. Users must comply with swisstopo's terms of use and provide proper attribution.

**Script License:**
Free to use, modify, and distribute. No warranty provided.

## Support

For technical issues:
1. Check the troubleshooting section above
2. Verify system requirements
3. Test with a small polygon first
4. Contact your Cyclone 3DR administrator

For swisstopo API issues:
- Visit: https://www.swisstopo.admin.ch/
- API documentation: https://api3.geo.admin.ch/

---

**Disclaimer / Haftungsausschluss:**

This script is not officially endorsed by Leica Geosystems or swisstopo. Users are responsible for complying with all applicable terms of use and ensuring data accuracy for their specific applications.

**EN:** Use at your own risk. Verify height data accuracy for critical applications.
**DE:** Nutzung auf eigene Gefahr. Überprüfen Sie die Genauigkeit der Höhendaten für kritische Anwendungen.