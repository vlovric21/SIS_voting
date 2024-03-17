| Prijava (Autentifikacija i autorizacija) | F01 |
| - | - |
| Opis | username/password (mail)<br> 2FA<br> OpenID<br> OAuth 2.0<br> JWT<br> Recaptcha? |

| Enkripcija glasova | F02 |
| - | - |
| Opis | Kriptiranje glasova prije spremanja u bazu<br> AES ili SHA<br> OpenSSL?<br> Poanta je zadržat “povjerljivost” glasova |

| Verifikacija glasova | F03 |
| - | - |
| Opis | Spriječit manipuliranje podataka u prijenosu<br> Digital signatures i/ili hash funkcije<br> GnuPG / HashCalc |

| Audit trail (trag revizije) | F04 |
| - | - |
| Opis | Logganje svih glasovanja<br> ID glasaca, vrijeme glasanja i “vote details”<br> Log4j / ELK Stack? |

| Testiranje | F05 |
| - | - |
| Opis | Penetration testing, vulnerability scanning, code review<br> OWASP ZAP / Nessus / SonarQube |

| Prikazat pollove | F06 |
| - | - |
| Opis | Kad korisnik doda svoj poll on se prikazuje ostalim korisnicima |

| Dodavanje novog polla | F07 |
| - | - |
| Opis | Korisnik dodaje novi poll, daje mu ime, opis i opcije |

| Odjava | F09 |
| - | - |
| Opis | Korisnik se može odjaviti |

| Detalji votea? | F0X |
| - | - |
| Opis | ? |

| Deployment? | F0X |
| - | - |
| Opis | AWS / Google Cloud Platform<br> Za testiranje skalabilnosti |

Develop a secure online voting system that ensures confidentiality, integrity, and availability of votes while protecting against hacking, fraud, and manipulation.
A practical component for developing a secure online voting system can be achieved by creating a prototype system that implements various security measures to ensure the confidentiality, integrity, and availability of votes. Here are the specific details on how this can be achieved:

  - <b>Authentication and Authorization</b>: The system should ensure that only authorized users can access the voting system. For this, the system can use various authentication mechanisms such as username and password, two-factor authentication, or biometric authentication. To implement these authentication mechanisms, freely available tools such as OpenlD connect, OAuth 2.0, and JSON Web Tokens (JWT) can be used.
  - <b>Encryption</b>: To ensure the confidentiality of votes, the system should encrypt the votes before storing them in the database. For this, the system can use various encryption techniques such as Advanced Encryption Standard (AES) and Secure Hash Algorithm (SHA). Freely available tools such as OpenSSL can be used to implement these encryption techniques.
  - <b>Verification</b>: To ensure the integrity of votes, the system should verify that the votes have not been tampered With during transmission or storage. For this, the system can use various verification techniques such as digital signatures and hash functions. Freely available tools such as GnuPG and HashCalc can be used to implement these verification techniques.
  - <b>Audit Trail</b>: The system should maintain an audit trail of all voting activity to ensure transparency and accountability. For this, the system can log all voting activity, including voter ID, time-stamp, and vote details. Freely available tools such as Log4j and ELK Stack can be used to implement the audit trail.
  - <b>Security Testing</b>: Finally, the system should be tested for security vulnerabilities using various security testing techniques such as penetration testing, vulnerability scanning, and code review. Freely available tools such as OWASP ZAP, Nessus, and SonarQube can be used to perform these security tests.

By combining these tools and techniques, a practical component for developing a secure online voting system can be achieved. The prototype system can be tested in a virtual environment using tools such as VirtualBox or VMware. The system can also be deployed on a cloud platform such as AWS or Google Cloud Platform to test its scalability and reliability
