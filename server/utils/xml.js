// VULN: V5.2 - XXE vulnerable XML parser
const { parseString } = require('xml2js');

// VULN: V5.2 - XML parsing with external entities enabled
function parseXML(xmlString) {
  return new Promise((resolve, reject) => {
    // xml2js doesn't natively support XXE, so we simulate the vulnerability
    // by checking for entity declarations and processing them
    const entityRegex = /<!ENTITY\s+(\w+)\s+SYSTEM\s+"([^"]+)"\s*>/g;
    const entities = {};
    let match;

    while ((match = entityRegex.exec(xmlString)) !== null) {
      const entityName = match[1];
      const entityValue = match[2];

      // VULN: V5.2 - Process SYSTEM entities (file:// and http://)
      if (entityValue.startsWith('file://')) {
        try {
          const fs = require('fs');
          const filePath = entityValue.replace('file://', '');
          entities[entityName] = fs.readFileSync(filePath, 'utf8');
        } catch (e) {
          entities[entityName] = `[Error reading ${entityValue}]`;
        }
      } else if (entityValue.startsWith('http://') || entityValue.startsWith('https://')) {
        entities[entityName] = `[External URL: ${entityValue}]`;
      }
    }

    // Replace entity references in XML
    let processedXml = xmlString;
    for (const [name, value] of Object.entries(entities)) {
      processedXml = processedXml.replace(new RegExp(`&${name};`, 'g'), value);
    }

    // Remove DOCTYPE declaration for xml2js
    processedXml = processedXml.replace(/<!DOCTYPE[^>]*>/, '');

    parseString(processedXml, { explicitArray: false }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

module.exports = { parseXML };
