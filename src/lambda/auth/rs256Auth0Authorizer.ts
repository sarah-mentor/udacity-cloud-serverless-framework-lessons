import {
  CustomAuthorizerEvent,
  CustomAuthorizerResult,
  CustomAuthorizerHandler
} from 'aws-lambda';
import 'source-map-support/register';

import { verify } from 'jsonwebtoken';
import { JwtToken } from '../../auth/JwtToken';

const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJIc5N10C1nCzIMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFmRldi1zbTJwNHl2dS5hdXRoMC5jb20wHhcNMTkwODA1MjA1MDAxWhcNMzMw
NDEzMjA1MDAxWjAhMR8wHQYDVQQDExZkZXYtc20ycDR5dnUuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwI3harZzeJv36mYlMJqO4k58
TevM+Sj/B0V8I+QyBjG65sSFD+P9RFFOVKgMrnLbaKQ1zHwy+42/HV7aItcqgOH5
YlTO8sgKXWJK9ELH0REZDf2LHAZWkiu5vfz9i2cL2WXtf+10+JNkz+06DFOEcjrM
lkuApOakGFaGTx58ZCaFzhEPmmpjyA/JbHfnJAeH0o1CIqmz+WLAIdfteiPNIuAq
+8EdTW/oUssFp7aEhk2KdcGhfhnzkQPK994QGixPp9LxD0En4MW3zhEwyeo18QhH
5IrwPx3QETCU2GbOrz5Iv9TlsBAOAVhUdyo9TZ45E5SsANqdPaS71q/dX5pIUQID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQWLFhiOjl7fkMBlMLK
WrHL0fJpLTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAEoI2Ywc
b7C0gLziSTxb9PbjxvaXhX3I+p20lw3c2/YfIEEMdAW2eBh1RMEbSJsvfZ0S9CVc
JEcQCYOHaw6rhSF4XJhyrYlGvZ90RMhqPIobDSbeLzA2U+bJbl40ZSy+lAimFH/f
k3LR+Q08brBW5jbEK/WWKTC/+dB8yJt3CFJsifbhCs4yKQD6SmgXSLCJjyjKaQyF
oxcBRSlo0auXSSyxhqgCY+AER8+7eQbv4HzwTiBihQc2GohOMyP4TqlkvFji97bQ
V6YcN7rbU+qx4olBi4SYkTBuwlayz/B9yi/s+obaRawQftgZ5bzcPd4s48dzLN7z
AC1htisrMQtxIUs=
-----END CERTIFICATE-----
`;

export const handler: CustomAuthorizerHandler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  try {
    const userJWTToken = verifyToken(event.authorizationToken);
    console.log('User was authorized', userJWTToken);

    return {
      principalId: userJWTToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    };
  } catch (e) {
    console.log('User was not authorized', e.message);

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    };
  }
};

function verifyToken(authHeader: string): JwtToken {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  // A request has been authorized.
  return verify(
    token,           // Token from an HTTP header to validate
    cert,            // A certificate copied from Auth0 website
    { algorithms: ['RS256'] } // We need to specify that we use the RS256 algorithm
  ) as JwtToken;
}