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
<#assign id = args.htmlid>
<#assign jsid = args.htmlid?js_string>

<script type="text/javascript">//<![CDATA[
(function()
{
   var comments = new Alfresco.dashlet.RecentComments("${jsid}").setOptions(
   {
      siteId: "${page.url.templateArgs.site!""}",
      maxItems: ${preferences.recentCommentsMaxItemsFilter!'20'},
      activeFilter: "${preferences.recentCommentsFilter!'all'}",
      rangeFilter: "${preferences.recentCommentsRangeFilter!''}"
   }).setMessages(
      ${messages}
   );

   new Alfresco.widget.DashletResizer("${jsid}", "${instance.object.id}");

   var activitiesFeedDashletEvent = new YAHOO.util.CustomEvent("openFeedClick");
   activitiesFeedDashletEvent.subscribe(comments.openFeedLink, comments, true);

   var refreshDashletEvent = new YAHOO.util.CustomEvent("refreshDashletClick");
   refreshDashletEvent.subscribe(comments.onRefresh, comments, true);

   new Alfresco.widget.DashletTitleBarActions("${jsid}").setOptions(
   {
      actions:
      [
         {
            cssClass: "rss",
            eventOnClick: activitiesFeedDashletEvent,
            tooltip: "${msg("dashlet.rss.tooltip")?js_string}"
         },
         {
            cssClass: "refresh",
            id: "-refresh",
            eventOnClick: refreshDashletEvent,
            tooltip: "${msg("dashlet.refresh.tooltip")?js_string}"
         }
      ]
   });
})();
//]]></script>

<div class="dashlet dashlet-comments">
   <div class="title">${msg('header')}</div>
   <div class="toolbar flat-button">
      <input id="${id}-all" type="checkbox" name="all" value="${msg('filter.all')}" checked="checked" />

      <#if page.url.templateArgs.site??>
        <input id="${id}-filter" type="button" name="filter" value="${msg('filter.documentLibrary')}" />
        <select id="${id}-filter-menu">
           <option value="blog">${msg('filter.blog')}</option>
           <option value="documentLibrary">${msg('filter.documentLibrary')}</option>
           <option value="links">${msg('filter.links')}</option>
        </select>
      <#else>
        <input id="${id}-filter" type="button" name="filter" value="${msg('filter.mySites')}" />
        <select id="${id}-filter-menu">
           <option value="mySites">${msg('filter.mySites')}</option>
           <option value="favouriteSites">${msg('filter.favouriteSites')}</option>
           <option value="allSites">${msg('filter.allSites')}</option>
           <option value="repository">${msg('filter.repository')}</option>
        </select>
      </#if>

      <input id="${id}-filter-range" type="button" name="filter-range" value="${msg('filter.all')}" />
      <select id="${id}-filter-range-menu">
         <option value="">${msg("filter.all")}</option>
         <option value="today">${msg("filter.today")}</option>
         <option value="7">${msg("filter.7days")}</option>
         <option value="14">${msg("filter.14days")}</option>
         <option value="30">${msg("filter.30days")}</option>
         <option value="61">${msg("filter.2months")}</option>
         <option value="182">${msg("filter.6months")}</option>
      </select>

      <input id="${id}-filter-max-items" type="button" name="filter-max-items" value="20" />
      <select id="${id}-filter-max-items-menu">
         <option value="5">5</option>
         <option value="10">10</option>
         <option value="15">15</option>
         <option value="20">20</option>
         <option value="30">30</option>
         <option value="50">50</option>
      </select>
   </div>
   <div class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
      <div class="comments" id="${id}-comments"></div>
   </div>
   <div class="ft footer">
      <div class="footer-left" id="${id}-footer"></div>
      <div class="footer-atol">
        <a href="http://www.atolcd.com" target="_blank" title="Atol Conseils & Développements">
          <img src="${page.url.context}/res/components/dashlets/comments/images/atolcd.png" alt="Atol" />
        </a>
      </div>
   </div>
</div>