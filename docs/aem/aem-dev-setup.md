---
title: Local Development Setup
sidebar_position: 1
tags: [aem, setup, local-development]
---


# Local Development Setup

This post describes the steps and software requirements one needs to follow, to create and set up a working, local AEM
instance.
Secondly, an example of using the "Maven Archetype" provides the necessary basics to bootstrap a new AEM
project, according to the best practices.

## TL:DR

1. Install Java
    1. [Download JDK](https://adoptopenjdk.net/)
    2. Add to $PATH
2. Login with Adobe Account & Download AEM
    1. [Adobe Software Distribution](https://experience.adobe.com/#/downloads/content/software-distribution/en/aemcloud.html)
    2. e.g AEM SDK v2021.3.5087.20210322T071003Z-210325
        1. Note, AEM Changed its Versioning for Cloud to `year + version + timestamp`.
    3. extract archive
    4. rename to `cq-author-p4502.jar`
        1. If you want to start a local publisher, name it to `cq-publish-p4503`.
        2. You can change the number to any valid port if you have something already running and blocking that specific
           port.
3. Start AEM Instance
    1. `java -jar cq-author-p4502.jar`
    2. wait 1-5 minutes (Newer Versions of AEM start a lot quicker, than e.g 6.3 or 6.4)
4. Install Maven
    1. [Download](https://maven.apache.org/download.cgi)
    2. Add to $PATH
5. Execute [Maven Archetype Command](#bootstrapping-a-development-environment-via-maven-archetype)
    1. `cd ./mysite`
    2. `mvn clean install -PautoInstallPackage`
6. Access [http://localhost:4502](http://localhost:4502) and login via admin:admin

Once you have shutdown (`ctrl+c`) your initial AEM Instance, you can / should start and shutdown AEM via the provided
scripts in `crx-quickstart/bin`.

## Requirements

The following section describes the software needed to run a local AEM instance, as well as being able to start
extending and customizing AEM.

### AEM

This setup works for all the latest major AEM Versions, including AEM as a Cloud Service, which is Adobes latest AEM
offering. The Cloud SDK and 6.5 are in active development and receive new features on a regular basis. The Cloud SDK is
being versioned via timestamps, such as `aem-sdk-2021.3.5026.20210309T210727Z-210225`, while the AEM On-Premise and
Managed Services offerings still bear the classic `major.minor.patch` level notation.

### Tools

- Java JDK
    - JDK v11 ->  AEM Cloud SDK + AEM ≥6.5
    - JDK v8 -> AEM ≤6.4
- Maven ≥3.39
- AEM-Repo Tool
    - Optional -> Conveniently push/pull content to the local JCR (AEMs Database)
- NodeJS + NPM
    - Optional -> Required, if one wants to use the SPA Framework (React / Angular Components)

## Setup

A local development setup consists of two parts.
One, the actual AEM instance (java process) running and,
secondly, the repository containing all the projects custom code.

### Running AEM locally

After downloading the desired AEM Version from
the [Adobe Software Distribution](https://experience.adobe.com/#/downloads/content/software-distribution/en/aemcloud.html)
extract the archive — if the cloud sdk has been downloaded.
Otherwise, we can directly run the jar.

By renaming the jar according to the following schema, a couple of default settings can be
set: `cq-(author|publish)-p(port)`.
For example `cq-author-p4502`.
When started, this will run the AEM instance as an
author and expose it locally via port 4502.

Running the jar is as easy as executing it like this: `java -jar my-downloaded-aem.jar -gui`.
The parameter `-gui` can be appended, to launch an additional small UI, which informs the user about the startup /
installation progress.
Additionally, `-gui` will automatically set the default admin users credentials to `admin:admin`.

### Configuring Debug Ports for Local Development

Do be able to attach a java debugger locally, the startup scripts need to be extended by a couple of arguments.

In each (author, publish) start script, find the following line

`if not defined CQ_JVM_OPTS set CQ_JVM_OPTS=[...]` and add the following arguments

`CQ_JVM_OPTS='-server -Xmx8024m -Djava.awt.headless=true -Xdebug -Xrunjdwp:transport=dt_socket,server=y,address=30303,suspend=n'`
.
Note, that the `address=30303` needs to be different for author and publish.

A debug run config in Intellij IDEA looks like this

![IntelliJ debug config](/images/aem/idea-debug-config.png)

### Bootstrapping a development environment via Maven Archetype

The Apache Maven Archetype describes Archetypes like this

> [...] provide a system that provides a consistent means of generating Maven projects. Archetype will help authors
> create Maven project templates for users, and provide users with the means to generate parameterized versions of
> those
> project templates.

To summarize, by using an archetype, which itself has been created by the AEM Developer Team, we can set specific
variables with which the archetype bootstraps itself and creates a customized set of files and directories — ready to
use.

The following example demonstrates a bash command using the v27 of the aem-project-archetype.
By setting 'appTitle', '
appId' and 'groupId' we tell the Archetype how it should name and structure our packages.
'frontendModule' can be one of the following items['none', 'general', 'react', 'angular'].
By specifying this parameter, we can opt in to use the (new) ui.frontend
module, which itself can be preconfigured with either a "classic" html variant, or one of the modern Javascript SPA
Frameworks - currently only React and Angular are supported.

If we do not specify an 'aemVersion' the latest AEM Cloud Sdk will be used. A specific version can be set via passing
the AEM version in its major.minor.patch level notation. For example 'aemVersion="6.4.8' would create the archetype
based on AEM 6.4 with Patch Level 8 and add all necessary dependencies to the pom.xml.

```bash
mvn -B archetype:generate \
 -D archetypeGroupId=com.adobe.aem \
 -D archetypeArtifactId=aem-project-archetype \
 -D archetypeVersion=27 \
 -D appTitle="My Site" \
 -D appId="mysite" \
 -D groupId="com.mysite" \
 -D frontendModule=react \
 -D includeExamples=y
```

The Archetype provides a wide range of optional properties, with sensible defaults set for each. For a list of all
available settings, please check
the [official documentation](https://github.com/adobe/aem-project-archetype#available-properties) on GitHub.

Executing the above command will create the following folder structure

```bash
Using AEM as a Cloud Service SDK version: 2021.3.5087.20210322T071003Z-210325
Creating content skeleton...
[INFO] Project created from Archetype in dir: /Users/nerlich/Downloads/temp/mysite
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  10.865 s
[INFO] Finished at: 2021-03-27T20:54:40+01:00
[INFO] ------------------------------------------------------------------------
```

`cd mysite`

```bash
-rw-r--r--   1 nerlich  staff  1.2K .gitignore
-rw-r--r--   1 nerlich  staff   11K LICENSE
-rw-r--r--   1 nerlich  staff  5.2K README.md
drwxr-xr-x   4 nerlich  staff  128B all/
drwxr-xr-x   3 nerlich  staff   96B analyse/
-rw-r--r--   1 nerlich  staff  494B archetype.properties
drwxr-xr-x   4 nerlich  staff  128B core/
drwxr-xr-x   6 nerlich  staff  192B dispatcher/
drwxr-xr-x   4 nerlich  staff  128B it.tests/
-rw-r--r--   1 nerlich  staff   28K pom.xml
drwxr-xr-x   5 nerlich  staff  160B ui.apps/
drwxr-xr-x   4 nerlich  staff  128B ui.apps.structure/
drwxr-xr-x   4 nerlich  staff  128B ui.config/
drwxr-xr-x   4 nerlich  staff  128B ui.content/
drwxr-xr-x  12 nerlich  staff  384B ui.frontend/
drwxr-xr-x  11 nerlich  staff  352B ui.tests/
```

Building and deploying the complete development environment can be done via the following
command `mvn clean install -PautoInstallSinglePackage` - executed in the root directory.

`ui.apps`, `ui.config` and `ui.content` can be individually build with the profile `-PautoInstallPackage`. Deploying
just the
java module 'core' can be achieved with the profile `-PautoInstallBundle`.

> I usually just run `mvn clean install -PautoInstallPackage` in my projects' root. The deployment is quick enough, and
> I
> can be sure that I did not forget anything.

## SonarQube Setup - Automatic Rule Evaluation

1. Use official SonarQube DockerCompose
   yml [DockerCompose Sonar + Postgres](https://github.com/SonarSource/docker-sonarqube/blob/master/example-compose-files/sq-with-postgres/docker-compose.yml)
    - save locally
    - update Postgres version to `v14`
    - on M1 (Apple Silicon) Mac add the following line
        - `platform: linux/amd64` to `sonarqube:`
            - https://stackoverflow.com/questions/66482075/docker-apple-silicon-m1-preview-sonarqube-no-matching-manifest-for-linux-arm6
        - `SONAR_SEARCH_JAVAADDITIONALOPTS: "-Dbootstrap.system_call_filter=false"` to `environment:`
            - https://community.sonarsource.com/t/failed-to-run-sonarqube-by-docker-compose-yml/52998
        - In your docker settings increase the available disc size to at least 100GB
2. (On Windows) Increase available ram via powershell
    - cd to `C:\Users\<username>`
    - Create a new file `.wslconfig`
    - Add the following two lines
        - ```
      [wsl2]
      kernelCommandLine = "sysctl.vm.max_map_count=262144"
        ```
    - run `wsl --shutdown`
    - reboot your machine
    - https://stackoverflow.com/a/69294687/4034811
3. Navigate to the above yml file in your local file system
    - `docker-compose up` (Add `-d` to run this in the background)
4. Navigate to `http://localhost:9000`
5. Login with the default SonarQube Credentials `admin/admin`
    - Update the password when prompted by the app
6. Go to `http://localhost:9000/admin/marketplace` and install the following Plugins
    - AEM Rules for SonarQube by "Wunderman Thompson Technology"
    - IBM iX AEM Sonar rules by "IBM iX"
    - For third-party plugins, place the .jar in your volume target of `sonarqube/extensions/plugins`
        - Default on Mac Docker Hub is `/opt/sonarqube/extensions/plugins`
        - On Windows, browse to `\\wsl$\docker-desktop-data\data\docker\volumes` via explorer
            - one folder for each volume exists
    - restart SonarQube
7. Go to 'Projects' -> Manually -> Analyse locally
    - Choose a token name
    - Generate a token
    - Save this token securely
8. Update your local maven settings according to the
   documentation http://localhost:9000/documentation/analysis/scan/sonarscanner-for-maven
9. Analyse your local project
    - Navigate to your projects root pom.xml file
    - Execute the sonar
      command `mvn clean verify sonar:sonar -Dsonar.projectKey=<your-project-name> -Dsonar.host.url=http://localhost:9000 -Dsonar.login=<your-token>`
    - Replace `<your-project-name>` and `<your-token>` with your own values generated in step 7.

### Add JaCoCo Unit Test Coverage

1. Navigate to your projects root `/pom.xml` file
2. Add the following line to the `<properties>` section
    - `<sonar.coverage.jacoco.xmlReportPaths>${project.basedir}/target/site/jacoco/jacoco.xml</sonar.coverage.jacoco.xmlReportPaths>`
    - `<sonar.coverage.exclusions>ui.apps/**/*,ui.tests/**/*,it.tests/**/*</sonar.coverage.exclusions>`
        - to exclude specific paths from the (coverage) analysis
3. Add the Jacoco Plugin
   ```xml
   <plugin>
        <groupId>org.jacoco</groupId>
        <artifactId>jacoco-maven-plugin</artifactId>
        <version>0.8.8</version>
        <executions>
            <execution>
            <id>prepare-and-report</id>
            <goals>
            <goal>prepare-agent</goal>
            <goal>report</goal>
            </goals>
            </execution>
            <execution>
            <id>report-aggregate</id>
            <phase>verify</phase>
            <goals>
            <goal>report-aggregate</goal>
            </goals>
            <configuration>
                <outputDirectory>${project.basedir}/../target/site/jacoco-aggregate</outputDirectory>
                <excludes>
                    <exclude>ui.apps/**/*</exclude>
                    <exclude>ui.tests/**/*</exclude>
                    <exclude>it.tests/**/*</exclude>
                </excludes>
            </configuration>
            </execution>
        </executions>
   </plugin>
   ```
4. Add the Sonar Maven Plugin
   ```xml
   <plugin>
    <groupId>org.sonarsource.scanner.maven</groupId>
    <artifactId>sonar-maven-plugin</artifactId>
    <version>3.8.0.2131</version>
    <executions>
        <execution>
            <phase>verify</phase>
            <goals>
                <goal>sonar</goal>
            </goals>
        </execution>
    </executions>
   </plugin>
   ```
5. If a module complains during a regular build due to missing credentials, add the following snippet to its pom. file
   e.g. `/ui.tests/pom.xml`
   ```xml
   <plugin>
       <groupId>org.sonarsource.scanner.maven</groupId>
       <artifactId>sonar-maven-plugin</artifactId>
       <executions>
           <execution>
               <phase>none</phase>
           </execution>
       </executions>
   </plugin>
   ```

### Connect Intellij IDEA SonarLint Plugin

1. Install the SonarLint Plugin from the IDEA Marketplace
2. Go to Settings -> Tools -> SonarLint
3. Click on the "+" icon and add your local SonarQube Instance (e.g. http://localhost:9000)
4. Go to `http://localhost:9000/account/security`
    - Generate a "user token"
    - Save this securely
5. In your IDEs Sonar Lint Settings add the token from step 4
6. Click apply and "Update binding" afterwards

## Set up a local Dispatcher with Docker

Just follow the steps described
here: [local-development-environment-set-up/dispatcher-tools](https://experienceleague.adobe.com/docs/experience-manager-learn/cloud-service/local-development-environment-set-up/dispatcher-tools.html).

On Windows, the `docker_run.cmd` file will need to be slightly modified. Remove the following lines:

- Line: 41 + 41
- Line 179 - 181

![Dispatcher Windows changes 1](/images/aem/dispatcher-windows1.png)
![Dispatcher Windows changes 2](/images/aem/dispatcher-windows2.png)

Thanks for reading!

luca

## See also

- [Dispatcher configuration](./dispatcher-configuration.mdx)
- [Deployment guide](./deployment.mdx)
- [Testing strategies](./testing.mdx)

## Links & Downloads

- [AEM Software Distribution](https://experience.adobe.com/#/downloads)
    - The official Adobe Experience Cloud Download Hub
- [Official AEM Archetype GitHub Page](https://github.com/adobe/aem-project-archetype)
- [AEM Core Components](https://github.com/adobe/aem-core-wcm-components)
- [AEM ACS Commons](https://adobe-consulting-services.github.io/acs-aem-commons/)
