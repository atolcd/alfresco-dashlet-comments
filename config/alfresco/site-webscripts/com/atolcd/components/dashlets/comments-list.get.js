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
main();

/**
 * Main entrypoint
 */
function main() {
  var commentFeeds = [];

  var comments = getComments();
  if (comments != null) {
    var i, ii;
    for (i=0, ii=comments.length ; i<ii ; i++) {
      var comment = comments[i];

      var item = {
        id: comment.id,
        content: comment.content,
        date: {
          isoDate: comment.modifiedOn,
          fullDate: fromISO8601(comment.modifiedOn)
        },
        modifiedBy: comment.modifiedBy,
        modifiedByUser: comment.modifiedByUser,
        userProfile: userProfileUrl(comment.modifiedByUser),
        itemPage: itemPageUrl(comment)
      };

      if (comment.site) {
        item.site = {
          shortName: comment.site.shortName,
          title: comment.site.title,
          sitePage: sitePageUrl(comment.site.shortName)
        };
      }

      commentFeeds.push(item);
    }
  }

  model.comments = commentFeeds;
}

/**
 * Call remote Repo script to get relevant activities
 */
function getComments() {
  var siteId = args.siteId || "";
  var containerId = args.containerId || "";
  var limit = args.limit || 20;
  var range = args.range || "";

  var url = "/slingshot/dashlets/comments/";
  if (siteId != "" ) {
    url += "site/" + encodeURI(siteId);
  } else {
    url += "user";
  }

  if (containerId != "") {
    url += "/" + containerId;
  }

  url += "?limit=" + limit + "&range=" + range;

  // Use alfresco-feed connector as a basic HTTP auth challenge will be issued
  connector = remote.connect("alfresco-feed");

  result = connector.get(url + "&format=json");

  if (result.status == 200) {
    // Create javascript objects from the server response
    return eval("(" + result + ")");
  }

  status.setCode(result.status, result.response);
  return null;
}

/**
 * URL to user profile page
 */
function userProfileUrl(userId) {
  return url.context + "/page/user/" + encodeURI(userId) + "/profile";
}

/**
 * URL to item page
 */
function itemPageUrl(comment) {
  var displayName = "", itemUrl = "";

  switch (comment.parent.type) {
    case "blog":
      displayName = comment.parent.title;
      itemUrl += 'blog-postview?postId=' + comment.parent.name;
      break;

    case "link":
      displayName = comment.parent.title;
      itemUrl += 'links-view?linkId=' + comment.parent.name;
      break;

    case "folder":
    case "document":
      displayName = comment.parent.name;
      itemUrl += comment.parent.type + "-details?nodeRef=" + comment.parent.nodeRef;
      break;
  }

  if (comment.site) {
    itemUrl = url.context + "/page/site/" + encodeURI(comment.site.shortName) + "/" + itemUrl;
  }
  else {
    itemUrl = url.context + "/page/" + itemUrl;
  }

  return {
    displayName: displayName,
    url: itemUrl
  };
}

/**
 * URL to site dashboard page
 */
function sitePageUrl(siteId) {
  return url.context + "/page/site/" + encodeURI(siteId) + "/dashboard";
}

/**
 * Convert from ISO8601 date to JavaScript date
 */
function fromISO8601(formattedString) {
   var isoRegExp = /^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;

   var match = isoRegExp.exec(formattedString);
   var result = null;

   if (match)
   {
      match.shift();
      if (match[1]){match[1]--;} // Javascript Date months are 0-based
      if (match[6]){match[6] *= 1000;} // Javascript Date expects fractional seconds as milliseconds

      result = new Date(match[0]||1970, match[1]||0, match[2]||1, match[3]||0, match[4]||0, match[5]||0, match[6]||0);

      var offset = 0;
      var zoneSign = match[7] && match[7].charAt(0);
      if (zoneSign != 'Z')
      {
         offset = ((match[8] || 0) * 60) + (Number(match[9]) || 0);
         if (zoneSign != '-')
         {
            offset *= -1;
         }
      }
      if (zoneSign)
      {
         offset -= result.getTimezoneOffset();
      }
      if (offset)
      {
         result.setTime(result.getTime() + offset * 60000);
      }
   }

   return result; // Date or null
}