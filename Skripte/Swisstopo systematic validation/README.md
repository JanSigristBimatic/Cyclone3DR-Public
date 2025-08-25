# Swisstopo Systematic Point Cloud Validation

**Professional point cloud validation tool for Cyclone 3DR** - Validates measured heights against official Swiss topographic reference data.

## 🎯 Overview

This script performs systematic grid-based validation of point cloud heights against official Swisstopo reference data. It's designed for professional surveying workflows requiring accuracy verification against national geodetic standards.

## ✨ Key Features

- **Systematic Grid Validation**: Automated grid-based sampling across entire point cloud bounding box
- **Official Swisstopo Integration**: Direct API connection to `api3.geo.admin.ch` for reference heights
- **Intelligent Ground Detection**: Advanced cylinder-based point extraction with median approximation
- **Professional Labeling**: Comprehensive labels with tolerance visualization and organized grouping
- **Detailed CSV Reports**: Statistical analysis with configurable export options
- **Robust Error Handling**: Multiple fallback strategies ensure reliable operation

## 🛠️ Requirements

- **Cyclone 3DR 2025.1.4** or newer
- **Windows environment** with curl command available
- **Internet connection** for Swisstopo API access
- **LV95 coordinate system** (EPSG:2056) point clouds

## 📋 Usage Instructions

### 1. Preparation
- Import your point cloud(s) into Cyclone 3DR
- Ensure coordinate system is **LV95 (EPSG:2056)**
- Select the point cloud(s) you want to validate

### 2. Script Execution
1. Run the script from Cyclone 3DR Scripts menu
2. Configure parameters in the dialog:
   - **Grid Spacing**: Distance between validation points (default: 20m)
   - **Search Radius**: Cylinder radius for point extraction (default: 1m)
   - **Error Threshold**: Maximum allowed deviation (default: 1m)
   - **Create All Labels**: Generate labels for all points or errors only
   - **Generate Report**: Enable detailed CSV export

### 3. Results
The script produces:
- **Validation Labels**: Color-coded labels showing deviations
- **Statistical Summary**: Console output with validation counts
- **CSV Report**: Detailed analysis file (optional)
- **Organized Groups**: Labels sorted by classification (OK/ERROR)

## 📊 Output Classifications

| Classification | Description | Color Coding |
|---------------|-------------|--------------|
| **OK** | Deviation within threshold | Green/Normal |
| **ERROR** | Deviation exceeds threshold | Red/Warning |
| **NO_DATA** | No point cloud data found | Yellow/Info |
| **API_FAILED** | Swisstopo API unavailable | Gray/Error |

## 🔧 Technical Details

### Algorithm Components

1. **Grid Generation**: Creates systematic validation points across bounding box
2. **Reference Height Query**: Retrieves official heights via Swisstopo REST API
3. **Point Cloud Sampling**: Uses centered cylinders for robust ground detection
4. **Height Calculation**: Median approximation of lower 25% points for accuracy
5. **Comparison & Classification**: Configurable tolerance-based validation
6. **Documentation**: Professional labels and comprehensive reporting

### API Integration
```javascript
// Swisstopo Height API
https://api3.geo.admin.ch/rest/services/height?easting={E}&northing={N}&sr=2056&format=json
```

### Ground Detection Method
- **Primary Method**: Median approximation using iterative cylinder approach
- **Fallback Method**: Lower quartile calculation (25% from minimum)
- **Performance Limit**: Handles complex scenes efficiently

## 📄 Label Information

Each validation label contains:
- **Row 0**: Measured height from point cloud
- **Row 1**: Swisstopo reference height
- **Row 2**: Height difference (deviation)
- **Row 3**: Point ID for traceability
- **Row 4**: Grid coordinates (Easting, Northing)

### Label Codes
- `1` = Measured height
- `2` = Swisstopo reference
- `3` = Deviation
- `4` = Point ID
- `5` = Coordinates

## 📈 CSV Report Format

| Column | Description | Unit |
|--------|-------------|------|
| Point_ID | Sequential point number | - |
| Easting | LV95 East coordinate | m |
| Northing | LV95 North coordinate | m |
| Measured_Height_m | Point cloud height | m |
| Swisstopo_Height_m | Reference height | m |
| Difference_m | Height deviation | m |
| Classification | Validation result | - |
| Grid_Spacing_m | Grid parameter | m |
| Search_Radius_m | Search parameter | m |
| Error_Threshold_m | Tolerance parameter | m |

## ⚙️ Configuration Parameters

### Grid Spacing (2-100m)
- **Small values (2-5m)**: Detailed analysis, more processing time
- **Medium values (10-25m)**: Balanced approach (recommended)
- **Large values (50-100m)**: Overview analysis, faster processing

### Search Radius (0.05-5m)
- **Small radius (0.1-0.5m)**: Precise point sampling
- **Medium radius (1-2m)**: Standard terrain analysis
- **Large radius (3-5m)**: Rough terrain or sparse data

### Error Threshold (0.02-10m)
- **Strict (0.02-0.1m)**: High precision surveys
- **Standard (0.5-2m)**: General validation
- **Lenient (5-10m)**: Rough terrain assessment

## 🚨 Troubleshooting

### Common Issues

**"No point cloud selected"**
- Ensure at least one SCloud object is selected before running

**"API request failed"**
- Check internet connection
- Verify coordinates are within Switzerland
- Try again later (API may be temporarily unavailable)

**"No cloud data found"**
- Increase search radius
- Check if point cloud covers the validation area
- Verify coordinate system alignment

**Performance issues**
- Reduce grid density (increase spacing)
- Limit validation area
- Close other resource-intensive applications

### Best Practices

1. **Start with larger grid spacing** for overview analysis
2. **Use appropriate search radius** based on point cloud density
3. **Validate coordinate system** before processing
4. **Check sample results** before full validation
5. **Save reports** for documentation and analysis

## 📋 License & Attribution

- **Script**: Developed for professional surveying workflows
- **Data Source**: © swisstopo - Swiss Federal Office of Topography
- **API**: Height data from `api3.geo.admin.ch`
- **Coordinate System**: LV95 (EPSG:2056)
- **Platform**: Leica Cyclone 3DR

---

**Version**: 1.2 (2025-08-25)  
**Compatibility**: Cyclone 3DR 2025.1.4+  
**Author**: Professional surveying automation