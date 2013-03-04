"Recent comments" dashlet for Alfresco Share
================================

This extension is a dashlet that **retrieves comments** stored in the repository and/or in sites (can be added either on a user or on a site dashboard).  
Dashlet's results can be filtered. Sort and filter preferences are saved for each user. There is also a RSS Feed.   

Building the module
-------------------
Check out the project if you have not already done so 

        git clone git://github.com/atolcd/alfresco-dashlet-comments.git

An Ant build script is provided to build JAR file **OR** AMP files containing the custom files.  

To build JAR file, run the following command from the base project directory:

        ant dist-jar

If you want to build AMP files, run the following command:

        ant dist-amp


Installing the module
---------------------
This extension is a standard Alfresco Module, so experienced users can skip these steps and proceed as usual.

### 1st method: Installing JAR (recommended)
1. Stop Alfresco
2. Copy `recent-comments-X.X.X.jar` into the `/tomcat/shared/lib/` folder of your Alfresco (you might need to create this folder if it does not already exist).
3. Start Alfresco


### 2nd method: Installing AMPs
1. Stop Alfresco
2. Use the Alfresco [Module Management Tool](http://wiki.alfresco.com/wiki/Module_Management_Tool) to install the modules in your Alfresco and Share WAR files:

        java -jar alfresco-mmt.jar install recent-comments-alfresco-module-vX.X.X.amp $TOMCAT_HOME/webapps/alfresco.war -force
        java -jar alfresco-mmt.jar install recent-comments-share-module-vX.X.X.amp $TOMCAT_HOME/webapps/share.war -force

3. Delete the `$TOMCAT_HOME/webapps/alfresco/` and `$TOMCAT_HOME/webapps/share/` folders.  
**Caution:** please ensure you do not have unsaved custom files in the webapp folders before deleting.
4. Start Alfresco



Using the module
---------------------
Add the dashlet on your (site/user) dashboard.  
  
Customize your user dashboard: `http://server:port/share/page/customise-user-dashboard`  
Customize a site dashboard: `http://server:port/share/page/site/{siteId}/customise-site-dashboard` (only available for site managers)  


LICENSE
---------------------
This extension is licensed under `GNU Library or "Lesser" General Public License (LGPL)`.  
Created by: [Bertrand FOREST] (https://github.com/bforest)  
Dashlet created for the [2011 Alfresco Dashlet Challenge](https://wiki.alfresco.com/wiki/Dashlet_Challenge#2011).  


Our company
---------------------
[Atol Conseils et Développements] (http://www.atolcd.com) is Alfresco [Gold Partner] (http://www.alfresco.com/partners/atol)  
Follow us on twitter [ @atolcd] (https://twitter.com/atolcd)  