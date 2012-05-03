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

/**
 * Comment view details action controller
 *
 * When creating a new title bar action controller it is necessary to call setOptions with the following
 * attributes in a hash:
 * - actions: an array of the actions to display (see below)
 *
 * Actions:
 * Each action can have the following attributes:
 * - cssClass (required)      : this should be a CSS class that defines a 16x16 image to render as the action icon
 * - tooltip (options)        : this should be a message to use for the hover help tooltip
 * - eventOnClick (optional)  : this is the custom event event that will be fired when the action is clicked
 * - linkOnClick (optional)   : this is URL that the browser will redirect to when the action is clicked
 * - targetOnClick (optional) : this is the URL that the browser display in a new window/tab
 * - bubbleOnClick (optional) : this should be an object containing "message" (String) and "messageArgs" (String array) attributes
 *
 * @namespace Alfresco.widget
 * @class Alfresco.widget.CommentViewDetailsActions
 */

var COMMENT_ACTIONS_OPACITY = 0,
   OPACITY_FADE_SPEED = 0.2;

(function()
{
   /**
    * YUI Library aliases
    */
   var Dom = YAHOO.util.Dom,
      Event = YAHOO.util.Event,
      Selector = YAHOO.util.Selector;

   /**
    * Comment View Details Action controller constructor.
    *
    * @return {Alfresco.widget.CommentViewDetailsActions} The new Alfresco.widget.CommentViewDetailsActions instance
    * @constructor
    */
   Alfresco.widget.CommentViewDetailsActions = function CommentViewDetailsActions_constructor(htmlId)
   {
      return Alfresco.widget.CommentViewDetailsActions.superclass.constructor.call(this, "Alfresco.widget.CommentViewDetailsActions", htmlId, ["selector"]);
   };

   YAHOO.extend(Alfresco.widget.CommentViewDetailsActions, Alfresco.component.Base,
   {
      /**
       * DOM node of comment
       *
       * @property comment
       * @type object
       * @default null
       */
      comment: null,

      /**
       * DOM node of comment icon
       * The first child DIV of comment with class="icon"
       *
       * @property commentIcon
       * @type object
       * @default null
       */
      commentIcon: null,

      /**
       * DOM node of comment details
       * Resizer will look for first child DIV of comment with class="details" and resize this element
       *
       * @property commentDetails
       * @type object
       * @default null
       */
      commentDetails: null,

      /**
       * The that node containing all the actions nodes. The actions are
       * grouped under a single parent so that only one animation effect needs
       * to be applied.
       *
       * @property actionsNode
       * @type object
       * @default null
       */
      actionsNode: null,

      /**
       * Fired by YUI when parent element is available for scripting.
       * Template initialisation, including instantiation of YUI widgets and event listener binding.
       *
       * @method onReady
       */
      onReady: function CommentViewDetailsActions_onReady()
      {
         this.comment = Selector.query("div.detail-list-item", Dom.get(this.id), true);
         this.commentIcon = Selector.query("div.icon", this.comment, true);
         this.commentDetails = Selector.query("div.details", this.comment, true);
         if (this.comment && this.commentIcon && this.commentDetails)
         {
            this.actionsNode = document.createElement("div");
            Dom.addClass(this.actionsNode, "viewCommentAction");  // This class sets the position of the actions.
            if (YAHOO.env.ua.ie > 0)
            {
               // IE doesn't handle the fading in/out very well so we won't do it.
              this.actionsNode.style.display = "none";
            }
            else
            {
               Dom.setStyle(this.actionsNode, "opacity", COMMENT_ACTIONS_OPACITY);
            }

            // Add the actions node
            this.comment.insertBefore(this.actionsNode, this.commentIcon);

            // Reverse the order of the arrays so that the first entry is furthest to the left...
            this.options.actions.reverse();
            // Iterate through the array of actions creating a node for each one...
            for (var i = 0; i < this.options.actions.length; i++)
            {
               var currAction = this.options.actions[i];
               if (currAction.cssClass && (currAction.eventOnClick ||
                                           currAction.linkOnClick ||
                                           currAction.targetOnClick ||
                                           currAction.bubbleOnClick))
               {
                  var currActionNode = document.createElement("div");  // Create the node
                  if (currAction.tooltip)
                  {
                     Dom.setAttribute(currActionNode, "title", currAction.tooltip);
                  }
                  Dom.addClass(currActionNode, "viewCommentActionIcon");
                  Dom.addClass(currActionNode, currAction.cssClass);   // Set the class (this should add the icon image
                  this.actionsNode.appendChild(currActionNode);        // Add the node to the parent

                  if (currAction.id)
                  {
                     currActionNode.id = this.id + currAction.id;
                  }

                  var _this = this;
                  if (currAction.eventOnClick)
                  {
                     var customEvent = currAction.eventOnClick; // Copy this value as the currAction handle will be reassigned...

                     // If the action is an event then the value passed should be a custom event that
                     // we will simply fire when the action node is clicked...
                     Event.addListener(currActionNode, "click", function(e)
                     {
                        _this._fadeOut(e, _this);
                        customEvent.fire({});
                     });
                  }
                  else if (currAction.linkOnClick)
                  {
                     var link = currAction.linkOnClick; // Copy this value as the currAction handle will be reassigned...

                     // If the action is a navigation link, then add a listener function that updates
                     // the browsers current location to be the supplied value...
                     Event.addListener(currActionNode, "click", function()
                     {
                        window.location = link;
                     });
                  }
                  else if (currAction.targetOnClick)
                  {
                     // If the action is a target link, then open a new window/tab and set its location
                     // to the supplied value...
                     var target = currAction.targetOnClick; // Copy this value as the currAction handle will be reassigned...

                     Event.addListener(currActionNode, "click", function()
                     {
                        window.open(target);
                     });
                  }
                  else if (currAction.bubbleOnClick)
                  {
                     var balloon = Atol.util.createBalloon(this.id,
                     {
                        html: currAction.bubbleOnClick.message,
                        width: "30em"
                     });

                     Event.addListener(currActionNode, "click", balloon.show, balloon, true);
                  }
               }
               else
               {
                  Alfresco.logger.warn("CommentViewDetailsActions_onReady: Action is not valid.");
               }
            }

            // Add a listener to animate the actions...
            Event.addListener(this.comment, "mouseover", this._fadeIn, this);
            Event.addListener(this.comment, "mouseout", this._fadeOut, this);
         }
         else
         {
            // It's not possible to set up the actions without the comment, its icon and the details
         }
      },

      /**
       * Fade the node actions out
       *
       * @method _fadeOut
       * @param e {event} The current event
       * @param me {scope} the context to run in
       * @protected
       */
      _fadeOut: function CommentViewDetailsActions__fadeOut(e, me)
      {
         if (YAHOO.env.ua.ie > 0)
         {
            me.actionsNode.style.display = "none";
         }
         else
         {
            // Only fade out if the mouse has left the comment entirely
            if (!Dom.isAncestor(me.comment, Event.getRelatedTarget(e)))
            {
               var fade = new YAHOO.util.Anim(me.actionsNode,
               {
                  opacity:
                  {
                     to: COMMENT_ACTIONS_OPACITY
                  }
               }, OPACITY_FADE_SPEED);
               fade.animate();
            }
         }
      },

      /**
       * Fade the actions node in
       *
       * @method _fadeIn
       * @param e {event} The current event
       * @param me {scope} the context to run in
       * @protected
       */
      _fadeIn: function CommentViewDetailsActions__fadeIn(e, me)
      {
         if (YAHOO.env.ua.ie > 0)
         {
            me.actionsNode.style.display = "block";
         }
         else
         {
            var fade = new YAHOO.util.Anim(me.actionsNode,
            {
               opacity:
               {
                  to: 1
               }
            }, OPACITY_FADE_SPEED);
            fade.animate();
         }
      }
   });
})();