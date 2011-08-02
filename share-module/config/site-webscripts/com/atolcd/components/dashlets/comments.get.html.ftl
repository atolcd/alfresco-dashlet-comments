<#--
 * Copyright (C) 2011 Atol Conseils et Développements.
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
<#assign el=args.htmlid?js_string>

<script type="text/javascript">//<![CDATA[
   new Alfresco.dashlet.RecentComments("${el}").setOptions(
   {
      siteId: "${page.url.templateArgs.site!""}",
      maxItems: ${preferences.recentCommentsMaxItemsFilter!'20'},
      activeFilter: "${preferences.recentCommentsFilter!'all'}",
      rangeFilter: "${preferences.recentCommentsRangeFilter!''}"
   }).setMessages(
      ${messages}
   );
   new Alfresco.widget.DashletResizer("${el}", "${instance.object.id}");
//]]></script>

<div class="dashlet dashlet-comments">
   <div class="refresh" id="${el}-refresh"><a href="#">&nbsp;</a></div>
   <div class="title">${msg('header')}</div>
   <div class="feed comments-feed"><a id="${el}-feedLink" href="#" target="_blank">&nbsp;</a></div>
   <div class="toolbar flat-button">
      <input id="${el}-all" type="checkbox" name="all" value="${msg('filter.all')}" checked="checked" />

      <#if page.url.templateArgs.site??>
        <input id="${el}-filter" type="button" name="filter" value="${msg('filter.documentLibrary')}" />
        <select id="${el}-filter-menu">
           <option value="blog">${msg('filter.blog')}</option>
           <option value="documentLibrary">${msg('filter.documentLibrary')}</option>
           <option value="links">${msg('filter.links')}</option>
        </select>
      <#else>
        <input id="${el}-filter" type="button" name="filter" value="${msg('filter.mySites')}" />
        <select id="${el}-filter-menu">
           <option value="mySites">${msg('filter.mySites')}</option>
           <option value="favouriteSites">${msg('filter.favouriteSites')}</option>
           <option value="allSites">${msg('filter.allSites')}</option>
           <option value="repository">${msg('filter.repository')}</option>
        </select>
      </#if>

      <input id="${el}-filter-range" type="button" name="filter-range" value="${msg('filter.all')}" />
      <select id="${el}-filter-range-menu">
         <option value="">${msg("filter.all")}</option>
         <option value="today">${msg("filter.today")}</option>
         <option value="7">${msg("filter.7days")}</option>
         <option value="14">${msg("filter.14days")}</option>
         <option value="30">${msg("filter.30days")}</option>
         <option value="61">${msg("filter.2months")}</option>
         <option value="182">${msg("filter.6months")}</option>
      </select>

      <input id="${el}-filter-max-items" type="button" name="filter-max-items" value="20" />
      <select id="${el}-filter-max-items-menu">
         <option value="5">5</option>
         <option value="10">10</option>
         <option value="15">15</option>
         <option value="20">20</option>
         <option value="30">30</option>
         <option value="50">50</option>
      </select>
   </div>
   <div class="body scrollableList" <#if args.height??>style="height: ${args.height}px;"</#if>>
      <div class="comments" id="${el}-comments"></div>
   </div>
   <div class="ft footer">
      <div class="footer-left" id="${el}-footer"></div>
      <div class="footer-atol">
        <a href="http://www.atolcd.com" target="_blank" title="Atol Conseils & Développements">
          <img src="${page.url.context}/res/components/dashlets/comments/images/atolcd.png" alt="Atol" />
        </a>
      </div>
   </div>
</div>