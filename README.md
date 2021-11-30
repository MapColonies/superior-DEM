# superior-DEM
WCS proxy to get different coverages based on different rules and using a csw catalog.

## Usage
The request the service supports are WCS get requests.
The subset query param is mandatory.

To select the rule wanted, one of the following values should be used as the `coverageId`:

### example
```
http://localhost:8081/wcs/?service=WCS&version=2.0.1&coverageId=DTMBestResolution&request=GetCoverage&format=image/geotiff&subset=Long(33,35)&subset=Lat(29,33)
```

## configurations
- WCS_URL - the url to get coverages from
- CSW_URL - the catalog url


