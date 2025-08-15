/// <reference path="C:/Program Files/Leica Geosystems/Cyclone 3DR/Script/JsDoc/Reshaper.d.ts"/>

// -----------------------------------------------------------------------------
//  GridHeightFromSwisstopo.js – v1.6 (2025-01-XX)
// -----------------------------------------------------------------------------
//  ENGLISH:
//  * Creates grid points within a closed polyline boundary
//  * Retrieves LV95 heights synchronously via Curl (compatible with all 3DR versions)
//  * Uses swisstopo's official geodata REST API
//  * Converts height values to proper Number format for SPoint.New()
//  * Adds points as SCloud and reports the count
//  
//  DEUTSCH:
//  * Legt Rasterpunkte in einer geschlossenen Polylinie an
//  * Holt LV95-Höhen synchron via Curl (kompatibel zu allen 3DR-Versionen)
//  * Nutzt die offizielle Geodaten-REST-API von swisstopo
//  * Konvertiert Höhenangaben ins korrekte Number-Format für SPoint.New()
//  * Fügt die Punkte als SCloud hinzu und meldet die Anzahl
// -----------------------------------------------------------------------------

// -------------------- PARAMETER DIALOG / PARAMETERDIALOG --------------------
var dlg = SDialog.New("Swisstopo Height Data / Swisstopo-Höhendaten");
dlg.AddText("EN: Select grid spacing for height points within polygon", SDialog.EMessageSeverity.Instruction);
dlg.AddText("DE: Rasterabstand für Höhenpunkte innerhalb des Polygons wählen", SDialog.EMessageSeverity.Instruction);
dlg.AddLength({
    id: "grid",
    name: "Grid spacing / Rasterabstand [m]",
    value: 2.0,
    min: 0.1,
    max: 100.0,
    saveValue: true,
    tooltip: "EN: Distance between grid points in meters | DE: Abstand zwischen Rasterpunkten in Metern"
});

var dialogResult = dlg.Run();
if (dialogResult.ErrorCode !== 0) {
    throw new Error("Operation cancelled by user / Vorgang vom Benutzer abgebrochen");
}
var GRID_SPACING = dialogResult.grid;

// -------------------- SELECTION CHECK / AUSWAHLPRÜFUNG ----------------------
var selectedPolylines = SMultiline.FromSel();
if (selectedPolylines.length !== 1) {
    SDialog.Message(
        "EN: Please select exactly one polyline\nDE: Bitte genau eine Polylinie auswählen",
        SDialog.EMessageSeverity.Error,
        "Selection Error / Auswahlfehler"
    );
    throw new Error("Invalid selection / Ungültige Auswahl");
}

var boundaryPolyline = selectedPolylines[0];
if (!boundaryPolyline.IsClosed()) {
    SDialog.Message(
        "EN: The selected polyline must be closed\nDE: Die gewählte Polylinie muss geschlossen sein",
        SDialog.EMessageSeverity.Error,
        "Polyline Error / Polylinienfehler"
    );
    throw new Error("Polyline not closed / Polylinie nicht geschlossen");
}

// -------------------- HELPER FUNCTIONS / HILFSFUNKTIONEN --------------------

/**
 * Point-in-polygon test using ray casting algorithm
 * EN: Tests if a point is inside a polygon
 * DE: Prüft ob ein Punkt innerhalb eines Polygons liegt
 * @param {SMultiline} polygon - The polygon to test against
 * @param {number} x - X coordinate to test
 * @param {number} y - Y coordinate to test
 * @returns {boolean} - True if point is inside polygon
 */
function isPointInsidePolygon(polygon, x, y) {
    var isInside = false;
    var vertexCount = polygon.GetNumber();
    var j = vertexCount - 1;

    for (var i = 0; i < vertexCount; i++) {
        var vertexI = polygon.GetPoint(i);
        var vertexJ = polygon.GetPoint(j);

        var xi = vertexI.GetX(), yi = vertexI.GetY();
        var xj = vertexJ.GetX(), yj = vertexJ.GetY();

        if (((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi + 1e-12) + xi)) {
            isInside = !isInside;
        }
        j = i;
    }
    return isInside;
}

/**
 * Synchronous height query via Curl & SFile
 * EN: Retrieves height from swisstopo API using LV95 coordinates
 * DE: Holt Höhe von swisstopo API mit LV95-Koordinaten
 * @param {number} easting - LV95 Easting coordinate
 * @param {number} northing - LV95 Northing coordinate
 * @returns {number|null} - Height in meters or null if failed
 */
function getHeightFromSwisstopo(easting, northing) {
    // swisstopo REST API URL for height queries
    var apiUrl = "https://api3.geo.admin.ch/rest/services/height" +
        "?easting=" + easting +
        "&northing=" + northing +
        "&sr=2056" +  // EPSG:2056 (LV95)
        "&format=json";

    // Create temporary file for curl output
    var tempFileName = TempPath() + "swisstopo_height_" +
        Math.round(easting) + "_" + Math.round(northing) + ".json";

    // Execute curl command to fetch data
    var curlResult = Execute("curl", ["-s", "-o", tempFileName, apiUrl]);
    if (curlResult !== 0) {
        print("Warning: Curl request failed for coordinates E=" + easting + ", N=" + northing);
        return null;
    }

    // Read and parse the JSON response
    var responseFile = SFile.New(tempFileName);
    var responseText = null;

    if (responseFile.Open(SFile.ReadOnly)) {
        responseText = responseFile.ReadAll();
        responseFile.Close();
        responseFile.Remove(); // Clean up temporary file
    }

    if (!responseText) {
        print("Warning: Failed to read API response");
        return null;
    }

    // Parse JSON and extract height value
    var heightValue = null;
    try {
        var apiResponse = JSON.parse(responseText);
        if (apiResponse.height !== undefined) {
            heightValue = parseFloat(apiResponse.height);
            if (isNaN(heightValue)) {
                heightValue = null;
            }
        }
    } catch (parseError) {
        print("Warning: Failed to parse API response JSON");
        heightValue = null;
    }

    return heightValue;
}

// -------------------- GRID GENERATION / RASTERERZEUGUNG ---------------------
print("EN: Starting grid generation with " + GRID_SPACING + "m spacing");
print("DE: Beginne Rastererzeugung mit " + GRID_SPACING + "m Abstand");

// Get bounding box of the polygon
var boundingBox = boundaryPolyline.GetBoundingBox();
var minX = boundingBox.LowPoint.GetX();
var maxX = boundingBox.UpPoint.GetX();
var minY = boundingBox.LowPoint.GetY();
var maxY = boundingBox.UpPoint.GetY();

print("Bounding box: X(" + minX.toFixed(2) + " - " + maxX.toFixed(2) +
    "), Y(" + minY.toFixed(2) + " - " + maxY.toFixed(2) + ")");

// Create output cloud
var heightCloud = SCloud.New();
heightCloud.SetName("Swisstopo_Grid_Heights_" + GRID_SPACING + "m");
heightCloud.SetColors(0.0, 0.6, 1.0); // Blue color
heightCloud.SetCloudRepresentation(SCloud.CLOUD_SMOOTH);

var pointCount = 0;
var failedQueries = 0;
var totalQueries = 0;

// Generate grid points
for (var currentX = minX; currentX <= maxX; currentX += GRID_SPACING) {
    for (var currentY = minY; currentY <= maxY; currentY += GRID_SPACING) {
        // Check if point is inside polygon
        if (!isPointInsidePolygon(boundaryPolyline, currentX, currentY)) {
            continue;
        }

        totalQueries++;

        // Get height from swisstopo API
        var heightValue = getHeightFromSwisstopo(currentX, currentY);

        if (heightValue === null) {
            failedQueries++;
            heightValue = 0.0; // Use fallback height
            print("Warning: Using fallback height 0.0 for point E=" +
                currentX.toFixed(2) + ", N=" + currentY.toFixed(2));
        }

        // Create and add point to cloud
        var gridPoint = SPoint.New(currentX, currentY, heightValue);
        heightCloud.AddPoint(gridPoint);
        pointCount++;

        // Progress feedback every 50 points
        if (pointCount % 50 === 0) {
            print("Progress: " + pointCount + " points processed");
        }
    }
}

// -------------------- RESULTS / ERGEBNISSE -----------------------------------
if (pointCount === 0) {
    SDialog.Message(
        "EN: No points generated. Check grid spacing and polygon area.\n" +
        "DE: Keine Punkte erzeugt. Prüfen Sie Rasterabstand und Polygonfläche.",
        SDialog.EMessageSeverity.Warning,
        "No Results / Keine Ergebnisse"
    );
} else {
    // Add cloud to document
    heightCloud.AddToDoc();

    // Success message
    var successMessage =
        "EN: Successfully created " + pointCount + " height points\n" +
        "DE: Erfolgreich " + pointCount + " Höhenpunkte erstellt\n\n" +
        "Grid spacing / Rasterabstand: " + GRID_SPACING + "m\n" +
        "API queries / API-Abfragen: " + totalQueries + "\n" +
        "Failed queries / Fehlgeschlagene Abfragen: " + failedQueries + "\n" +
        "Success rate / Erfolgsrate: " + ((totalQueries - failedQueries) / totalQueries * 100).toFixed(1) + "%";

    SDialog.Message(
        successMessage,
        SDialog.EMessageSeverity.Success,
        "Grid Generation Complete / Rastererzeugung abgeschlossen"
    );

    print("Grid generation completed successfully");
    print("Cloud name: " + heightCloud.GetName());
    print("Total points: " + pointCount);
}

// -------------------- DATA SOURCE ATTRIBUTION --------------------------------
print("");
print("Data source attribution:");
print("© swisstopo - Swiss Federal Office of Topography");
print("Height data retrieved from api3.geo.admin.ch");
print("Coordinate system: LV95 (EPSG:2056)");
print("");
print("Datenquellenangabe:");
print("© swisstopo - Bundesamt für Landestopografie");
print("Höhendaten abgerufen von api3.geo.admin.ch");
print("Koordinatensystem: LV95 (EPSG:2056)");