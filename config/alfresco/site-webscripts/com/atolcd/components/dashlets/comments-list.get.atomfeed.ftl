<#--
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
-->
<#assign siteId = args.siteId!"">
<#if siteId?has_content>
   <#assign title = msg("in.site", msg("message.comments.feed.title"), siteId) />
<#else>
   <#assign title = msg("message.comments.feed.title") />
</#if>
<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <generator version="1.0">Alfresco (1.0)</generator>
  <link rel="self" href="${absurl(url.full)?xml}" />
  <id>${absurl(url.full)?xml}</id>
  <title>${title?xml}</title>
  <#if comments?exists && comments?size &gt; 0>
    <updated>${comments[0].date.isoDate}</updated>
    <#list comments as comment>
      <#assign itemLink = "<a href=\"${absurl(comment.itemPage.url)}\">${comment.itemPage.displayName?html}</a>">
      <#assign userLink = "<a href=\"${absurl(comment.userProfile)}\">${comment.modifiedBy?html}</a>">
      <#assign detail =  msg("message.commented-on", userLink, itemLink, comment.date.fullDate?datetime?string(msg("date-format.rfc822"))) />
      <#assign entryTitle = msg("message.commented", comment.modifiedBy, comment.itemPage.displayName) />
      <#if comment.site?has_content>
        <#assign siteLink = "<a href=\"${absurl(comment.site.sitePage)}\">${comment.site.title?html}</a>">
        <#assign detail = msg("in.site", detail, siteLink) />
        <#assign entryTitle = msg("in.site", entryTitle, comment.site.title) />
      </#if>
      <entry xmlns='http://www.w3.org/2005/Atom'>
        <title><![CDATA[${entryTitle?xml}]]></title>
        <link rel="alternate" type="text/html" href="${absurl(comment.itemPage.url)}" />
        <id>${comment.id}</id>
        <updated>${comment.date.isoDate}</updated>
        <summary type="html">
          <![CDATA[${detail}.<br>${comment.content}]]>
        </summary>
        <author>
          <name>${comment.modifiedBy?xml}</name>
          <uri>${absurl(comment.userProfile)?xml}</uri>
        </author>
      </entry>
    </#list>
  </#if>
</feed>