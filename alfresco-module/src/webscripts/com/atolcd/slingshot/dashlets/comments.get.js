<import resource="classpath:/alfresco/templates/webscripts/org/alfresco/slingshot/search/search.lib.js">
/*
 * Copyright (C) 2012 Atol Conseils et Développements.
 * http://www.atolcd.com/
 * Author: Bertrand FOREST
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

const COMPANY_HOME_SPACE_QNAME_PATH = "/app:company_home/";
const COMMENTS_ROOT_SPACE_QNAME_PATH = "/cm:Comments/";

function getCommentItem(node) {
  var parts = splitQNamePath(node);

  var item = {
    nodeRef: node.nodeRef.toString(),
    id: node.id,
    name: node.name,
    content: node.content || "",
    title: node.properties["cm:title"],
    modifiedOn: node.properties["cm:modified"],
    modifiedByUser: node.properties["cm:modifier"],
    createdOn: node.properties["cm:created"],
    createdByUser: node.properties["cm:creator"],
    parent : node.parent.parent.parent
  };
  item.modifiedBy = getPersonDisplayName(item.modifiedByUser);
  item.createdBy = getPersonDisplayName(item.createdByUser);

  if (parts != null && parts[0] != null && parts[1] != null) {
    item.container = parts[1];
    item.site = getSiteData(parts[0]);
  }

  return item;
}

function buildMultipleSitesSearch(sitesList) {
  var i, length = sitesList.length, q = "";

  if (length > 0) {
    var site = sitesList[0];
    q += ' AND (';
    q += 'PATH:"' + SITES_SPACE_QNAME_PATH + 'cm:' + ((site instanceof String) ? site : site.shortName) + '//*' + COMMENTS_ROOT_SPACE_QNAME_PATH + '*"';
    for (i=1 ; i<length ; i++) {
      site = sitesList[i];
      q += ' OR PATH:"' + SITES_SPACE_QNAME_PATH + 'cm:' + ((site instanceof String) ? site : site.shortName) + '//*' + COMMENTS_ROOT_SPACE_QNAME_PATH + '*"';
    }
    q += ')';
  }

  return q;
}

function buildQuery(range) {
  var query = 'EXACTTYPE:"fm:post"';

  var requestContext = url.match.split("/")[4]; // Could be 'user' or 'site'
  if (requestContext == "user")
  {
    var filter = url.templateArgs['filter'];
    if (!filter)
    {
      // Search comments on entire repository
      query += ' AND PATH:"' + COMPANY_HOME_SPACE_QNAME_PATH + '/*' + COMMENTS_ROOT_SPACE_QNAME_PATH + '*"';
    }
    else if (filter == "repository")
    {
      // Search comments on entire repository EXCEPT on sites
      query += ' AND PATH:"' + COMPANY_HOME_SPACE_QNAME_PATH + '/*' + COMMENTS_ROOT_SPACE_QNAME_PATH + '*"';
      query += ' AND NOT PATH:"' + SITES_SPACE_QNAME_PATH + '/*"';
    }
    else if (filter == "mySites")
    {
      // Search comments on the sites that I belong to
      var mySites = siteService.listUserSites(person.properties.userName);
      if (mySites.length == 0) {
        // No sites == no results
        return "";
      }

      query += buildMultipleSitesSearch(mySites);
    }
    else if (filter == "allSites")
    {
      // Search comments on all sites (my sites and public sites)
      query += ' AND PATH:"' + SITES_SPACE_QNAME_PATH + '/*' + COMMENTS_ROOT_SPACE_QNAME_PATH + '*"';
    }
    else if (filter == "favouriteSites")
    {
      // Search comments on my favourite sites
      var favouriteSiteShortNames = [];

      // Favourite sites : get the preferences for the person
      var favouriteSites = preferenceService.getPreferences(person.properties.userName, "org.alfresco.share.sites.favourites");

      // Try to get favourite sites (could be null)
      try {
        favouriteSites = favouriteSites.org.alfresco.share.sites.favourites;
      } catch(e) {
        logger.log("[Recent comments] Failed to retrieve favourite sites: " + e.message);
        return "";
      }

      for (site in favouriteSites) {
        if (favouriteSites[site]) {
          favouriteSiteShortNames.push(new String(site));
        }
      }
      query += buildMultipleSitesSearch(favouriteSiteShortNames);
    }
  }
  else if (requestContext == "site")
  {
    var siteId = url.templateArgs['siteId'];
    if (siteId)
    {
      var componentId = url.templateArgs['componentId'];
      if (componentId)
      {
        // Search comments on the site {siteId} in the container {containerId} (could be : blog, documentLibrary or links)
        query += ' AND PATH:"' + SITES_SPACE_QNAME_PATH + 'cm:' + siteId + '/cm:' + componentId + '//*' + COMMENTS_ROOT_SPACE_QNAME_PATH + '*"';

        // TODO: do a filter on type (cm:folder / cm:content) ?
        // Could not be done in the Lucene query
      }
      else
      {
        // Search all comments on the site {siteId}
        query += ' AND PATH:"' + SITES_SPACE_QNAME_PATH + 'cm:' + siteId + '//*' + COMMENTS_ROOT_SPACE_QNAME_PATH + '*"';
      }
    }
    else
    {
      status.setCode(status.STATUS_BAD_REQUEST, "Site ID value missing from request.");
      return "";
    }
  }
  else
  {
    status.setCode(status.STATUS_BAD_REQUEST, "Invalid request context.");
    return "";
  }

  if (range != "") {
    var from, to;
    if(isNaN(range)) {
      // today
      from = new Date(); from.setHours(0); from.setMinutes(0); from.setSeconds(0);
      to = new Date(); to.setHours(23); to.setMinutes(59);  to.setSeconds(59);
    }
    else {
      // period
      to = new Date();
      from = new Date(to.getTime() - (parseInt(range, 10) * 24 * 60 * 60 * 1000));
    }
    query += ' AND @cm\\:modified:[' + utils.toISO8601(from) + ' TO ' + utils.toISO8601(to) + ']';
  }

  return query;
}

function main() {
  var i, ii,
      comments = [],
      limit = args.limit || 20,
      range = args.range || "";

  var query = buildQuery(range);
  if (query != "") {
    if (logger.isLoggingEnabled()) {
      logger.log("[Recent comments] query: " + query);
    }

    var nodes = search.luceneSearch(query, 'cm:modified', false, limit);
    for (i=0, ii=nodes.length ; i<ii ; i++) {
      var comment = getCommentItem(nodes[i]);
      if (comment) {
        comments.push(comment);
      }
    }
  }

  return comments;
}

model.comments = main();