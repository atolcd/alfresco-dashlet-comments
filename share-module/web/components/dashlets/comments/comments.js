/*
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
 */

/**
 * Dashboard Comments component.
 *
 * @namespace Alfresco
 * @class Alfresco.dashlet.RecentComments
 */
(function ()
{
  /**
   * YUI Library aliases
   */
  var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

  /**
   * Alfresco Slingshot aliases
   */
  var $html = Alfresco.util.encodeHTML,
      $userProfile = Alfresco.util.userProfileLink,
      $combine = Alfresco.util.combinePaths;

  /**
   * Preferences
   */
  var PREFERENCES_DASHLET = "org.alfresco.share.dashlet",
      PREF_USER_COMMENTS_FILTER = PREFERENCES_DASHLET + ".recentCommentsFilter",
      PREF_SITE_COMMENTS_FILTER = PREFERENCES_DASHLET + ".site.recentCommentsFilter",
      PREF_USER_COMMENTS_MAX_ITEMS_FILTER = PREFERENCES_DASHLET + ".recentCommentsMaxItemsFilter",
      PREF_SITE_COMMENTS_MAX_ITEMS_FILTER = PREFERENCES_DASHLET + ".site.recentCommentsMaxItemsFilter",
      PREF_USER_COMMENTS_RANGE_FILTER = PREFERENCES_DASHLET + ".recentCommentsRangeFilter",
      PREF_SITE_COMMENTS_RANGE_FILTER = PREFERENCES_DASHLET + ".site.recentCommentsRangeFilter";


  /**
   * Dashboard RecentComments constructor.
   *
   * @param {String} htmlId The HTML id of the parent element
   * @return {Alfresco.dashlet.RecentComments} The new component instance
   * @constructor
   */
  Alfresco.dashlet.RecentComments = function RecentComments_constructor(htmlId)
  {
    return Alfresco.dashlet.RecentComments.superclass.constructor.call(this, "Alfresco.dashlet.RecentComments", htmlId);
  };

  /**
   * Extend from Alfresco.component.Base and add class implementation
   */
  YAHOO.extend(Alfresco.dashlet.RecentComments, Alfresco.component.Base, {
    /**
     * Object container for initialization options
     *
     * @property options
     * @type object
     */
    options: {
      /**
       * Max items filter.
       *
       * @property maxItems
       * @type integer
       * @default 20
       */
      maxItems: 20,

      /**
       * Currently active filter.
       *
       * @property activeFilter
       * @type string
       * @default "all"
       */
      activeFilter: "all",

      /**
       * Currently range filter.
       *
       * @property rangeFilter
       * @type string
       * @default ""
       */
      rangeFilter: ""
    },

    /**
     * Comments DOM container.
     *
     * @property commentsContainer
     * @type object
     */
    commentsContainer: null,

    /**
     * Comments DOM footer.
     *
     * @property footer
     * @type object
     */
    footer: null,

    /**
     * ContainerId for comments scope query
     *
     * @property containerId
     * @type string
     * @default ""
     */
    containerId: null,

    /**
     * Fired by YUI when parent element is available for scripting
     * @method onReady
     */
    onReady: function RecentComments_onReady()
    {
      var me = this;

      // The comments container
      this.commentsContainer = Dom.get(this.id + "-comments");
      this.footer = Dom.get(this.id + "-footer");

      // Hook the refresh icon click
      Event.addListener(this.id + "-refresh", "click", this.onRefresh, this, true);

      // Preferences service
      this.services.preferences = new Alfresco.service.Preferences();

      // "All" filter
      this.widgets.all = new YAHOO.widget.Button(this.id + "-all", {
        type: "checkbox",
        value: "all",
        checked: true
      });
      this.widgets.all.on("checkedChange", this.onAllCheckedChanged, this.widgets.all, this);

      // Dropdown filter
      this.widgets.filter = new YAHOO.widget.Button(this.id + "-filter", {
        type: "split",
        menu: this.id + "-filter-menu",
        lazyloadmenu: false
      });
      this.widgets.filter.on("click", this.onFilterClicked, this, true);

      // Clear the lazyLoad flag and fire init event to get menu rendered into the DOM
      var menu = this.widgets.filter.getMenu();
      menu.subscribe("click", function (p_sType, p_aArgs)
      {
        var menuItem = p_aArgs[1];
        if (menuItem)
        {
          me.widgets.filter.set("label", menuItem.cfg.getProperty("text"));
          if (!p_aArgs[2]) { // Silent mode ?
            me.onFilterChanged.call(me, p_aArgs[1]);
          }
        }
      });

      // Dropdown range filter
      this.widgets.rangeFilter = new YAHOO.widget.Button(this.id + "-filter-range", {
        type: "split",
        menu: this.id + "-filter-range-menu",
        lazyloadmenu: false
      });
      this.widgets.rangeFilter.on("click", this.onRangeFilterClicked, this, true);

      // Clear the lazyLoad flag and fire init event to get menu rendered into the DOM
      var rangeMenu = this.widgets.rangeFilter.getMenu();
      rangeMenu.subscribe("click", function (p_sType, p_aArgs)
      {
        var menuItem = p_aArgs[1];
        if (menuItem)
        {
          me.widgets.rangeFilter.set("label", menuItem.cfg.getProperty("text"));

          if (!p_aArgs[2]) { // Silent mode ?
            me.onRangeFilterChanged.call(me, p_aArgs[1]);
          }
        }
      });

      // Dropdown maxItems filter
      this.widgets.maxItemsFilter = new YAHOO.widget.Button(this.id + "-filter-max-items", {
        type: "split",
        menu: this.id + "-filter-max-items-menu",
        lazyloadmenu: false
      });
      this.widgets.maxItemsFilter.on("click", this.onMaxItemsFilterClicked, this, true);

      // Clear the lazyLoad flag and fire init event to get menu rendered into the DOM
      var maxItemsMenu = this.widgets.maxItemsFilter.getMenu();
      maxItemsMenu.subscribe("click", function (p_sType, p_aArgs)
      {
        var menuItem = p_aArgs[1];
        if (menuItem)
        {
          me.widgets.maxItemsFilter.set("label", menuItem.cfg.getProperty("text"));
          if (!p_aArgs[2]) { // Silent mode ?
            me.onMaxItemsFilterChanged.call(me, p_aArgs[1]);
          }
        }
      });


      /** Check default item menu **/
      var checkMenuItem = function(pMenu, pFilterValue, pSilent) {
        // Loop through and find the menuItem corresponding to the default filter
        var menuItems = pMenu.getItems(), menuItem, i, ii;

        for (i = 0, ii = menuItems.length; i < ii; i++) {
          menuItem = menuItems[i];
          if (menuItem.value == pFilterValue) {
            pMenu.clickEvent.fire(
            {
              type: "click"
            }, menuItem, pSilent);
            break;
          }
        }
      };

      // Initialize filter
      if (this.options.activeFilter == "all") {
        this.widgets.filter.value = (this.options.siteId != "") ? "documentLibrary" : "mySites";
        this.setActiveFilter("all", true, true);
      }
      else {
        this.widgets.filter.value = this.options.activeFilter;
        this.containerId = this.options.activeFilter;
        checkMenuItem(menu, this.options.activeFilter, true); // Silent call
      }

      // Initialize range filter
      if (this.options.rangeFilter == "") {
        this.setRangeFilter("", true, true);
      }
      else {
        this.widgets.rangeFilter.value = this.options.rangeFilter;
        checkMenuItem(rangeMenu, this.options.rangeFilter, true); // Silent call
      }

      // Initialize maxItems filter
      if (this.options.maxItems == 20) {
        this.setMaxItemsFilter(20);
      }
      else {
        this.widgets.maxItemsFilter.value = this.options.maxItems;
        checkMenuItem(maxItemsMenu, this.options.maxItems);
      }
    },

    /**
     * Updates the href attribute on the feed link
     * @method updateFeedLink
     */
    updateFeedLink: function RecentComments_updateFeedLink()
    {
       var link = Dom.get(this.id + "-feedLink");
       if (link) {
          var url = Alfresco.constants.URL_FEEDSERVICECONTEXT + "components/dashlets/comments/list?";
          var dataObj =
          {
             format: "atomfeed",
             siteId: this.options.siteId,
             containerId: this.containerId,
             limit: this.options.maxItems,
             range: this.options.rangeFilter
          };
          url += Alfresco.util.Ajax.jsonToParamString(dataObj, true);
          link.setAttribute("href", url);
       }
    },

    /**
     * Event handler for refresh click
     * @method onRefresh
     * @param e {object} Event
     */
    onRefresh: function RecentComments_onRefresh(e)
    {
      if (e)
      {
        // Stop browser's default click behaviour for the link
        Event.preventDefault(e);
      }
      Dom.replaceClass(this.id + "-refresh", "refresh", "refresh-loading");
      this.refreshComments();
    },

    /**
     * Refresh comments
     * @method refreshComments
     */
    refreshComments: function RecentComments_refreshComments()
    {
      // Update RSS Feed
      this.updateFeedLink();

      // Hide the existing content
      Dom.setStyle(this.commentsContainer, "display", "none");

      var url = Alfresco.constants.PROXY_URI + "slingshot/dashlets/comments/";
      if (this.options.siteId != "")
      {
        url += $combine("site", this.options.siteId, this.containerId);
      }
      else
      {
        url += $combine("user", this.containerId);
      }

      // Make an AJAX request to the comments webscripts
      Alfresco.util.Ajax.jsonGet(
      {
        url: url + "?limit=" + this.options.maxItems + "&range=" + this.options.rangeFilter,
        successCallback: {
          fn: this.onCommentsSuccess,
          scope: this
        },
        failureCallback: {
          fn: this.onCommentsFailed,
          scope: this
        },
        scope: this,
        noReloadOnAuthFailure: true
      });
    },

    /**
     * Comments retrieved successfully
     * @method onCommentsSuccess
     * @param p_response {object} Response object from request
     */
    onCommentsSuccess: function RecentComments_onCommentsSuccess(p_response)
    {
      // Retrieve the comments list from the JSON response and trim accordingly
      var comments = p_response.json || [],
          html = "",
          i, ii;

      // Comments to show?
      if (comments.length === 0)
      {
        html = '<div class="detail-list-item first-item last-item"><div class="msg">' + this.msg("message.no-comments") + '</div></div>';
        this.footer.innerHTML = "";
      }
      else
      {
        var me = this;

        html = "<ul>";
        // Generate HTML mark-up for each comment
        for (i = 0, ii = comments.length; i < ii; i++)
        {
          var comment = comments[i];
          var id = this.id + '-preview-' + comment.id;

          html += '<li class="comment' + ((i == ii - 1) ? ' last-item' : '') + '" id="' + id + '">';
          html += '<div class="detail-list-item">';
          html += '<div class="icon">' + this.getCommentIcon(comment) + '</div>';

          html += '<div class="details">';
          html += this.msg("message.type." + comment.parent.type) + this.getDisplayNodeTemplate(comment) + " " +
          this.msg("message.commented.by") + $userProfile(comment.createdByUser, comment.createdBy, 'class="theme-color-1"') + " ";

          if (this.options.rangeFilter == "today") {
            html += Alfresco.util.formatDate(Alfresco.thirdparty.fromISO8601(comment.createdOn), this.msg("comments.date-format.today"));
          }
          else {
            html += this.msg("message.commented.on") + Alfresco.util.formatDate(Alfresco.thirdparty.fromISO8601(comment.createdOn), this.msg("comments.date-format.default"));
          }

          if (comment.site && (this.options.siteId != comment.site.shortName))
          {
            html += " " + this.msg("message.in.site") +
            '<a href="' + Alfresco.constants.URL_PAGECONTEXT + 'site/' + comment.site.shortName + '/dashboard" class="theme-color-1">' +
              $html(comment.site.title) +
            '</a>';
          }
          html += '</div>'; // details
          html += '</div>';
          html += '</li>'; // detail-list-item

        }
        html += "</ul>";

        this.footer.innerHTML = this.msg((comments.length == 1) ? "message.footer.comment" : "message.footer.comments", comments.length);
        // Fade the new content in
        Alfresco.util.Anim.fadeIn(this.footer);
      }
      this.commentsContainer.innerHTML = html;

      // Fade the new content in
      Alfresco.util.Anim.fadeIn(this.commentsContainer);
      Dom.replaceClass(this.id + "-refresh", "refresh-loading", "refresh");

      // Add tooltips
      for (i = 0, ii = comments.length; i < ii; i++) {
        var comm = comments[i];
        new Alfresco.widget.CommentViewDetailsActions(this.id + '-preview-' + comm.id).setOptions({
          actions: [
            {
              cssClass: "comment",
              bubbleOnClick: {
                 message: comm.content
              },
              tooltip: this.msg("message.see-comment.info")
            }
          ]
        });
      }
    },

    /**
     * Comments request failed
     * @method onCommentsFailed
     */
    onCommentsFailed: function RecentComments_onCommentsFailed()
    {
      this.commentsContainer.innerHTML = '<div class="detail-list-item first-item last-item"><div class="msg">' + this.msg("refresh-failed") + '</div></div>';
      Alfresco.util.Anim.fadeIn(this.commentsContainer);
      Dom.replaceClass(this.id + "-refresh", "refresh-loading", "refresh");
    },

    /**
     * Generate icon uri for a comment
     * @method getCommentIcon
     * @param comment {object} Comment object literal
     */
    getCommentIcon: function RecentComments_getCommentIcon(comment)
    {
      var iconUrl = "",
          alt = "";

      switch (comment.parent.type)
      {
      case "blog":
        alt = comment.parent.title;
        iconUrl += Alfresco.constants.URL_CONTEXT + 'components/images/blogpost-32.png';
        break;

      case "link":
        alt = comment.parent.title;
        iconUrl += Alfresco.constants.URL_CONTEXT + 'res/components/images/link-32.png';
        break;

      case "folder":
        alt = comment.parent.name;
        iconUrl += Alfresco.constants.URL_CONTEXT + 'components/images/filetypes/generic-folder-32.png';
        break;

      case "document":
        alt = comment.parent.name;
        iconUrl += comment.parent.icon;
        break;
      }

      return YAHOO.lang.substitute('<img alt="{fileName}" src="{nodeIconUrl}">', {
        fileName: alt,
        nodeIconUrl: iconUrl
      });
    },

    /**
     * Generate parent uri for a comment
     * @method getDisplayNodeTemplate
     * @param comment {object} Comment object literal
     */
    getDisplayNodeTemplate: function RecentComments_getDisplayNodeTemplate(comment)
    {
      var displayName = "",
          url = "";
      switch (comment.parent.type)
      {
      case "blog":
        displayName = comment.parent.title;
        url += 'blog-postview?postId=' + comment.parent.name;
        break;

      case "link":
        displayName = comment.parent.title;
        url += 'links-view?linkId=' + comment.parent.name;
        break;

      case "folder":
      case "document":
        displayName = comment.parent.name;
        url += comment.parent.type + "-details?nodeRef=" + comment.parent.nodeRef;
        break;
      }

      if (comment.site)
      {
        url = Alfresco.constants.URL_PAGECONTEXT + "site/" + comment.site.shortName + "/" + url;
      }
      else
      {
        url = Alfresco.constants.URL_PAGECONTEXT + url;
      }

      return '<a href="' + url + '" class="theme-color-1">' + $html(displayName) + '</a>';
    },

    /**
     * Sets the active filter highlight in the UI
     * @method updateFilterUI
     */
    updateFilterUI: function RecentComments_updateFilterUI()
    {
      switch (this.options.activeFilter)
      {
        case "all":
          Dom.removeClass(this.widgets.filter.get("element"), "yui-checkbox-button-checked");
          break;

        default:
          this.widgets.all.set("checked", false, true);
          Dom.addClass(this.widgets.filter.get("element"), "yui-checkbox-button-checked");
          break;
      }

      // Not pretty
      // Dom.addClass(this.widgets.maxItemsFilter.get("element"), "yui-checkbox-button-checked");
      // Dom.addClass(this.widgets.rangeFilter.get("element"), "yui-checkbox-button-checked");
    },

    /**
     * Saves active filter to user preferences
     * @method saveActiveFilter
     * @param filter {string} New filter to set
     * @param noPersist {boolean} [Optional] If set, preferences are not updated
     * @param silent {boolean} [Optional] If set, comments will not be refreshed
     */
    setActiveFilter: function RecentComments_saveActiveFilter(filter, noPersist, silent)
    {
      this.options.activeFilter = filter;
      this.containerId = filter !== "all" ? filter : "";
      this.updateFilterUI();

      if (!silent) {
        this.refreshComments();
        if (noPersist !== true)
        {
          this.services.preferences.set((this.options.siteId != "") ? PREF_SITE_COMMENTS_FILTER : PREF_USER_COMMENTS_FILTER, filter);
        }
      }
    },

    /**
     * Saves range filter to user preferences
     * @method setRangeFilter
     * @param filter {string} New filter to set
     * @param noPersist {boolean} [Optional] If set, preferences are not updated
     * @param silent {boolean} [Optional] If set, comments will not be refreshed
     */
    setRangeFilter: function RecentComments_setRangeFilter(filter, noPersist, silent)
    {
      this.options.rangeFilter = filter;
      this.updateFilterUI();

      if (!silent) {
        this.refreshComments();

        if (noPersist !== true)
        {
          this.services.preferences.set((this.options.siteId != "") ? PREF_SITE_COMMENTS_RANGE_FILTER : PREF_USER_COMMENTS_RANGE_FILTER, filter);
        }
      }
    },

    /**
     * Saves maxItems filter to user preferences
     * @method setMaxItemsFilter
     * @param filter {string} New filter to set
     * @param noPersist {boolean} [Optional] If set, preferences are not updated
     * @param silent {boolean} [Optional] If set, comments will not be refreshed
     */
    setMaxItemsFilter: function RecentComments_setMaxItemsFilter(filter, noPersist, silent)
    {
      this.options.maxItems = filter;
      this.updateFilterUI();

      if (!silent) {
        this.refreshComments();

        if (noPersist !== true)
        {
          this.services.preferences.set((this.options.siteId != "") ? PREF_SITE_COMMENTS_MAX_ITEMS_FILTER : PREF_USER_COMMENTS_MAX_ITEMS_FILTER, filter);
        }
      }
    },


    /**
     * YUI WIDGET EVENT HANDLERS
     * Handlers for standard events fired from YUI widgets, e.g. "click"
     */

    /**
     * All tasks
     * @method onAllCheckedChanged
     * @param p_oEvent {object} Button event
     * @param p_obj {object} Button
     */
    onAllCheckedChanged: function RecentComments_onAllCheckedChanged(p_oEvent, p_obj)
    {
      this.setActiveFilter("all");
      p_obj.set("checked", true, true);
    },

    /**
     * Filter button clicked event handler
     * @method onFilterClicked
     * @param p_oEvent {object} Dom event
     */
    onFilterClicked: function RecentComments_onFilterClicked(p_oEvent)
    {
      this.setActiveFilter(this.widgets.filter.value);
    },

    /**
     * Filter button clicked event handler
     * @method onRangeFilterClicked
     * @param p_oEvent {object} Dom event
     */
    onRangeFilterClicked: function RecentComments_onRangeFilterClicked(p_oEvent)
    {
      this.setRangeFilter(this.widgets.rangeFilter.value || "");
    },

    /**
     * Filter button clicked event handler
     * @method onMaxItemsFilterClicked
     * @param p_oEvent {object} Dom event
     */
    onMaxItemsFilterClicked: function RecentComments_onMaxItemsFilterClicked(p_oEvent)
    {
      this.setMaxItemsFilter(parseInt(this.widgets.maxItemsFilter.value, 10));
    },

    /**
     * Filter drop-down changed event handler
     * @method onFilterChanged
     * @param p_oMenuItem {object} Selected menu item
     */
    onFilterChanged: function RecentComments_onFilterChanged(p_oMenuItem)
    {
      var filter = p_oMenuItem.value;
      this.widgets.filter.value = filter;
      this.setActiveFilter(filter);
    },

    /**
     * MaxItems ilter drop-down changed event handler
     * @method onMaxItemsFilterChanged
     * @param p_oMenuItem {object} Selected menu item
     */
    onMaxItemsFilterChanged: function RecentComments_onMaxItemsFilterChanged(p_oMenuItem)
    {
      var filter = p_oMenuItem.value;
      this.widgets.maxItemsFilter.value = filter;
      this.setMaxItemsFilter(filter);
    },

    /**
     * Range ilter drop-down changed event handler
     * @method onRangeFilterChanged
     * @param p_oMenuItem {object} Selected menu item
     */
    onRangeFilterChanged: function RecentComments_onRangeFilterChanged(p_oMenuItem)
    {
      var filter = p_oMenuItem.value;
      this.widgets.rangeFilter.value = filter;
      this.setRangeFilter(filter);
    }
  });
})();