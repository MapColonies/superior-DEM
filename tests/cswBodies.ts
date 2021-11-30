export const emptyResponse = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<csw:GetRecordsResponse xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dct="http://purl.org/dc/terms/" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gml="http://www.opengis.net/gml" xmlns:ows="http://www.opengis.net/ows" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.0.2" xsi:schemaLocation="http://www.opengis.net/cat/csw/2.0.2 http://schemas.opengis.net/csw/2.0.2/CSW-discovery.xsd">
    <csw:SearchStatus timestamp="2021-11-29T13:49:13Z"/>
    <csw:SearchResults numberOfRecordsMatched="0" numberOfRecordsReturned="0" nextRecord="0" recordSchema="http://schema.mapcolonies.com/dem" elementSet="full"/>
</csw:GetRecordsResponse>`;

export const singleRecordResponse = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<csw:GetRecordsResponse xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dct="http://purl.org/dc/terms/" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gml="http://www.opengis.net/gml" xmlns:ows="http://www.opengis.net/ows" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:mc="http://schema.mapcolonies.com/dem" version="2.0.2" xsi:schemaLocation="http://www.opengis.net/cat/csw/2.0.2 http://schemas.opengis.net/csw/2.0.2/CSW-discovery.xsd">
    <csw:SearchStatus timestamp="2021-11-29T09:23:22Z"/>
    <csw:SearchResults numberOfRecordsMatched="1" numberOfRecordsReturned="1" nextRecord="0" recordSchema="http://schema.mapcolonies.com/dem" elementSet="full">
        <mc:MCDEMRecord>
            <mc:coverageID>dem__30n030e_20101117_gmted_min075</mc:coverageID>
            <mc:id>632afeae-03c0-4f42-a006-bd1edf11874f</mc:id>
            <mc:resolutionMeter>250</mc:resolutionMeter>
            <mc:imagingTimeEndUTC>2010-11-17T17:43:00Z</mc:imagingTimeEndUTC>
        </mc:MCDEMRecord>
        </csw:SearchResults>
        </csw:GetRecordsResponse>`;

export const multipleRecordsResponse = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<csw:GetRecordsResponse xmlns:csw="http://www.opengis.net/cat/csw/2.0.2" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dct="http://purl.org/dc/terms/" xmlns:gmd="http://www.isotc211.org/2005/gmd" xmlns:gml="http://www.opengis.net/gml" xmlns:ows="http://www.opengis.net/ows" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:mc="http://schema.mapcolonies.com/dem" version="2.0.2" xsi:schemaLocation="http://www.opengis.net/cat/csw/2.0.2 http://schemas.opengis.net/csw/2.0.2/CSW-discovery.xsd">
    <csw:SearchStatus timestamp="2021-11-29T09:23:22Z"/>
    <csw:SearchResults numberOfRecordsMatched="2" numberOfRecordsReturned="2" nextRecord="0" recordSchema="http://schema.mapcolonies.com/dem" elementSet="full">
        <mc:MCDEMRecord>
            <mc:coverageID>dem__30n030e_20101117_gmted_min075</mc:coverageID>
            <mc:id>632afeae-03c0-4f42-a006-bd1edf11874f</mc:id>
            <mc:resolutionMeter>250</mc:resolutionMeter>
            <mc:imagingTimeEndUTC>2010-11-17T17:43:00Z</mc:imagingTimeEndUTC>
        </mc:MCDEMRecord>
        <mc:MCDEMRecord>
            <mc:coverageID>dem__n32_e035_1arc_v3</mc:coverageID>
            <mc:id>532afeae-03c0-4f42-a006-bd1edf11874f</mc:id>
            <mc:resolutionMeter>30</mc:resolutionMeter>
            <mc:imagingTimeEndUTC>2000-02-11T17:43:00Z</mc:imagingTimeEndUTC>
        </mc:MCDEMRecord></csw:SearchResults>
        </csw:GetRecordsResponse>'`;

export const errorResponse = `<?xml version="1.0" encoding="UTF-8"?><ows:ExceptionReport xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:ows="http://www.opengis.net/ows/2.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="2.0.0" xsi:schemaLocation="http://www.opengis.net/ows/2.0 http://schemas.opengis.net/ows/2.0/owsExceptionReport.xsd">
<ows:Exception locator="request">
<ows:ExceptionText>oh noes</ows:ExceptionText>
</ows:Exception>
</ows:ExceptionReport>`;
