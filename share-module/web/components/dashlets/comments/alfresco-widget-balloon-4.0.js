/**
 * Copyright (C) 2005-2010 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * Creates a "balloon tooltip" UI control attached to a passed-in element.
 *
 * @method Alfresco.util.createBalloon
 * @param p_context {Element|string} Element (or DOM ID) to align the balloon to
 * @param p_params {object} Optional additional configuration to override the defaults
 * <pre>
 *    width {string} CSS width of the tooltip. Defaults to 30em
 * </pre>
 * @return {object|null} Balloon instance
 */
Alfresco.util.createBalloon = function(p_context, p_params)
{
   var elContext = YUIDom.get(p_context);
   if (YAHOO.lang.isNull(elContext))
   {
      return null;
   }

   p_params = YAHOO.lang.merge(
   {
      effectType: YAHOO.widget.ContainerEffect.FADE,
      effectDuration: 0.25,
      html: "",
      text: "",
      closeButton: true,
      width: "30em"
   }, p_params || {});

   return (new Alfresco.widget.Balloon(elContext, p_params));
};

(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event;

   /**
    * Alfresco library aliases
    */
   var $html = Alfresco.util.encodeHTML,
      PREVENT_SCROLLBAR_FIX = (YAHOO.widget.Module.prototype.platform === "mac" && 0 < YAHOO.env.ua.gecko && YAHOO.env.ua.gecko < 2);

   /**
    * Alfresco.widget.Balloon constructor.
    * Should not be created directly, but via the Alfresco.util.createBalloon static function.
    *
    * @param p_context {Element|string} Element (or DOM ID) to align the balloon to
    * @param p_params {object} Optional additional configuration to override the defaults
    * @return {Alfresco.widget.Balloon} The new Balloon instance
    * @constructor
    */
   Alfresco.widget.Balloon = function(p_context, p_params)
   {
      var balloon = new YAHOO.widget.Overlay(Alfresco.util.generateDomId(),
      {
         context:
         [
            p_context,
            "tr",
            "tr",
            ["beforeShow", "windowResize"]
         ],
         constraintoviewport: true,
         visible: false,
         width: p_params.width || "30em",
         effect:
         {
            effect: p_params.effectType,
            duration: p_params.effectDuration
         }
      });

      if (PREVENT_SCROLLBAR_FIX)
      {
         // Prevent Mac Firefox 3.x scrollbar bugfix from being applied by YUI
         balloon.hideEvent.unsubscribe(balloon.hideMacGeckoScrollbars, balloon, true);
         balloon.showEvent.unsubscribe(balloon.showMacGeckoScrollbars, balloon, true);
         balloon.hideMacGeckoScrollbars = function (){ Dom.replaceClass(this.element, "prevent-scrollbars", "hide-scrollbars"); },
         balloon.showMacGeckoScrollbars = function(){ Dom.replaceClass(this.element, "hide-scrollbars", "prevent-scrollbars"); };
      }

      var wrapper = document.createElement("div")/*,
         arrow = document.createElement("div")*/;

      Dom.addClass(wrapper, "balloon");
      // Dom.addClass(arrow, "balloon-arrow");

      if (p_params.closeButton)
      {
         var closeButton = document.createElement("div");
         closeButton.innerHTML = "&nbsp;";
         Dom.addClass(closeButton, "closeButton");
         Event.addListener(closeButton, "click", this.hide, this, true);
         wrapper.appendChild(closeButton);
      }

      var content = document.createElement("div");
      Dom.addClass(content, "text");
      content.innerHTML = p_params.html || $html(p_params.text);
      wrapper.appendChild(content);
      // wrapper.appendChild(arrow);

      balloon.setBody(wrapper);
      balloon.render(document.body);

      this.balloon = balloon;
      this.content = content;

      this.onClose = new YAHOO.util.CustomEvent("close" , this);
      this.onShow = new YAHOO.util.CustomEvent("show" , this);
      return this;
   };

   Alfresco.widget.Balloon.prototype =
   {
      /**
       * YAHOO.widget.Overlay instance
       *
       * @property balloon
       */
      balloon: null,

      /**
       * Element containing balloon's content
       *
       * @property content
       */
      content: null,

      /**
       * Hides the balloon
       *
       * @method hide
      */
      hide: function Balloon_hide()
      {
         this.balloon.hide();
         this.onClose.fire();
      },

      /**
       * Shows the balloon
       *
       * @method show
      */
      show: function Balloon_show()
      {
         this.balloon.show();
         this.balloon.bringToTop();
         this.onShow.fire();
      },

      /**
       * Sets the HTML content of the balloon.
       *
       * @method html
       * @param content {String} Contents will be inserted as-is with no escaping.
      */
      html: function Balloon_html(content)
      {
         this.content.innerHTML = content;
         this.balloon.align();
      },

      /**
       * Sets the text content of the balloon.
       *
       * @method text
       * @param content {String} Contents will be inserted after being safely HTML-encoded.
      */
      text: function Balloon_text(content)
      {
         this.content.innerHTML = $html(content);
         this.balloon.align();
      }
   };
})();
