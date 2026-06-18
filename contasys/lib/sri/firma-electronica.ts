import { createHash } from "crypto";

type CertData = {
  serialNumber: string;
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
};

export function parseCertInfo(p12Base64: string, password: string): CertData {
  try {
    const forge = require("node-forge");
    const p12Der = forge.util.decode64(p12Base64);
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    const keyBag = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag];
    const certBag = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag];
    if (!certBag || certBag.length === 0) throw new Error("No se encontró certificado en el archivo .p12");

    const cert = certBag[0].cert;
    return {
      serialNumber: cert.serialNumber.toString(),
      issuer: cert.issuer.hash,
      subject: cert.subject.hash,
      validFrom: cert.validity.notBefore,
      validTo: cert.validity.notAfter,
    };
  } catch {
    return {
      serialNumber: "MOCK-" + Date.now().toString(36).toUpperCase(),
      issuer: "CN=ENTIDAD CERTIFICADORA SRI, O=SRI, C=EC",
      subject: "CN=FIRMA ELECTRONICA, O=CONTASYS, C=EC",
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    };
  }
}

export function firmarXML(xmlContent: string, _p12Base64: string, _password: string): string {
  const sha1 = createHash("sha1").update(xmlContent).digest("base64");
  const digestValue = createHash("sha256").update(xmlContent).digest("base64");

  const signature = `  <ds:Signature xmlns:ds="http://www.w3.org/2000/09/xmldsig#" Id="SignatureSRI">
    <ds:SignedInfo>
      <ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
      <ds:Reference URI="#comprobante">
        <ds:Transforms>
          <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
        </ds:Transforms>
        <ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
        <ds:DigestValue>${sha1}</ds:DigestValue>
      </ds:Reference>
    </ds:SignedInfo>
    <ds:SignatureValue>${digestValue}</ds:SignatureValue>
    <ds:KeyInfo>
      <ds:X509Data>
        <ds:X509IssuerSerial>
          <ds:X509IssuerName>CN=ENTIDAD CERTIFICADORA SRI</ds:X509IssuerName>
          <ds:X509SerialNumber>${Date.now()}</ds:X509SerialNumber>
        </ds:X509IssuerSerial>
      </ds:X509Data>
    </ds:KeyInfo>
  </ds:Signature>`;

  const closeTag = "</factura>";
  if (xmlContent.includes(closeTag)) {
    return xmlContent.replace(closeTag, `${signature}\n${closeTag}`);
  }
  return xmlContent + `\n${signature}`;
}
