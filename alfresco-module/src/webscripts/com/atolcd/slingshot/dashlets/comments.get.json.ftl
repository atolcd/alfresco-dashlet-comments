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
<#macro dateFormat date>${xmldate(date)}</#macro>
<#macro renderItem item>
  <#escape x as jsonUtils.encodeJSONString(x)>
  {
    "name": "${item.name}",
    "nodeRef": "${item.nodeRef}",
    "id": "${item.id}",
    "content": "${item.content}",
    "createdOn": "<@dateFormat item.createdOn />",
    "createdBy": "${item.createdBy!''}",
    "createdByUser": "${item.createdByUser!''}",
    "modifiedOn": "<@dateFormat item.modifiedOn />",
    "modifiedByUser": "${item.modifiedByUser}",
    "modifiedBy": "${item.modifiedBy}",
    <#if item.site??>
    "site":
    {
      "shortName": "${item.site.shortName}",
      "title": "${item.site.title}",
      "container": "${item.container}"
    },
    </#if>
    "parent": {
      "name": "${item.parent.name}",
      "title": "${item.parent.properties["lnk:title"]!item.parent.properties.title!""}",
      "nodeRef": "${item.parent.nodeRef}",
      <@compress single_line=true>"type": <@parentType item.parent />,</@>
      "icon": "${url.context}${item.parent.icon32}"
    }
  }
  </#escape>
</#macro>

<#escape x as jsonUtils.encodeJSONString(x)>
[
  <#if comments??>
    <#list comments?sort_by("modifiedOn")?reverse as comment>
      <@renderItem comment /><#if comment_has_next>,</#if>
    </#list>
  </#if>
]
</#escape>


<#macro parentType node>
  <#if node.isContainer>
    "folder"
  <#elseif node.typeShort == "lnk:link">
    "link"
  <#elseif node.parent.name == "blog" && node.parent.hasAspect("st:siteContainer")>
    "blog"
  <#else>
    "document"
  </#if>
</#macro>