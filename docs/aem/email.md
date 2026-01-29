---
title: E-Mail Service in AEM
sidebar_position: 25
tags: [aem, email, operations]
---

# Sending E-Mails in AEM

This post describes how the built-in MessageGateway can be used to send an E-Mail in AEM.
To test this functionality locally and without having to configure or pay for a publically usable E-Mail provider,
we are using [MailHog](https://github.com/mailhog/MailHog) in a Docker Container.

The following is a minimal working example of sending a test 'SimpleMail'.
You would usually extract these methods into a custom EmailService.

## Sending a SimpleMail

Add a default service

```json title="/apps/<your-project>/osgiconfig/config.author/com.day.cq.mailer.DefaultMailService.cfg.json"
{
    "smtp.host": "localhost",
    "smtp.port": "1025",
    // the mailhog smpt port
    "smtp.user": "",
    "smtp.password": "",
    "from.address": "noreply@mailhog.com",
    "smtp.ssl": false,
    "smtp.starttls": false,
    "smtp.requiretls": false,
    "debug.email": false,
    "oauth.flow": false
}
```

Inject the MessageGatewayService

```java
import com.day.cq.mailer.MessageGatewayService;

@Reference
private MessageGatewayService messageGatewayService;
```

Create a new SimpleMail

```java
final SimpleEmail simpleEmail = new SimpleEmail();
simpleEmail.setFrom("from@from.com", "Firstname Lastname");
simpleEmail.addHeader("X-Mailer", "Adobe Experience Manager");
simpleEmail.addHeader("Content-Type", "text/plain; charset=utf-8");
simpleEmail.setCharset("utf-8");
simpleEmail.setSubject("A Test-Message");
simpleEmail.setMsg("Hello from AEM.");
simpleEmail.setTo(List.of(new InternetAddress("reciever@reciever.com")));
```

Send the created message via the messageGatewayService

```java
messageGatewayService.getGateway(Email.class).send(simpleEmail);
```

The E-Mail was successfully sent to our _proxy_ MailHog:
![mailhog.png](/images/aem/mailhog.png)

## Links

- [Default Message Gateway](https://experienceleague.adobe.com/en/docs/experience-manager-learn/cloud-service/networking/examples/email-service)
- [MailHog](https://github.com/mailhog/MailHog)

## See also

- [OSGi configuration](./osgi-configuration.mdx)
- [Security basics](./security.mdx)
