module Coroutine                #:nodoc:
  module MichaelHintbuble       #:nodoc:
    module Helpers              #:nodoc:
      
      # This method returns a javascript tag containing the hint bubble initialization logic. The first argument
      # to this method is <tt>target_id</tt>, the id of the html element to which the hint bubble is anchored.  
      # The target_id is required and should be unique (duh). Further options may be provided; those that 
      # are specific to the hint bubble are:
      #
      # * <tt>:content</tt> - the content to display in the hint bubble (i.e., an alternative to block notation)
      # * <tt>:position</tt> - css-style values that specify the hint bubble's relative position (e.g. top right)
      # * <tt>:event_names</tt> - an array of strings specifying the events that should trigger the display of the tooltip
      # * <tt>:before_show</tt> - a Javascript function that will be invoked before the hint bubble is shown
      # * <tt>:after_show</tt> - a Javascript function that will be invoked after the hint bubble has been shown
      # * <tt>:before_hide</tt> - a Javascript function that will be invoked before the hint bubble is hidden
      # * <tt>:after_hide</tt> - a Javascript function that will be invoked after the hint bubble has been hidden
      #
      # 
      # ==== Events
      #
      # The library manages repositioning the hint bubble in response to resizing and scrolling events automatically.
      # You do not need to specify <tt>resize</tt> or <tt>scroll</tt> in the optional events array.
      #
      # The library defaults to trapping mouse gestures, but it is capable of trapping focus events in addition
      # to or in place of mouse events.  When specifying events, you need only reference the positive action: the
      # library can infer the corresponding action to toggle off the tooltip.
      #
      # Valid entries for the events array are any combination of the following options:
      #
      # * <tt>"focus"</tt>
      # * <tt>"mouseover"</tt>
      #
      #
      # ==== Example
      # 
      # # Generates: 
      # #
      # # <script type="text/javascript">
      # #   //<![CDATA[
      # #     MichaelHintbuble.Bubble.instances["foo_target_id"] = new MichaelHintbuble.Bubble("What up, foo?", { "event_names": ["mouseover"], "position": "top center" });
      # #   //]]>
      # # </script>
      # <%= render_bubble :foo_target_id, :content => "What up, foo?", :position => "top center" %>
      #   
      # In this case, a simple hint bubble is produced with the specified text content.  The bubble responds to mouseover/mouseout
      # events and centers itself above the target element when shown.
      # 
      #
      # ==== Example
      # 
      # # Generates: 
      # #
      # # <script type="text/javascript">
      # #   //<![CDATA[
      # #     MichaelHintbuble.Bubble.instances["bar_target_id"] = new MichaelHintbuble.Bubble("<ul><li>Item 1</li><li>Item 2</li></ul>", { "event_names": ["focus"], "position": "center left" });
      # #   //]]>
      # # </script>
      # <%= render_bubble :bar_target_id, :event_names => ["focus"], :position => "center left" %>
      #   <ul>
      #     <li>Item 1</li>
      #     <li>Item 2</li>
      #   </ul>
      # <% end %>
      #   
      # In this case, a slightly more complex hint bubble is produced with the specified markup.  The bubble responds to focus/blur
      # events and positions itself to the left of the target.
      #
      def render_bubble(target_id, options = {}, &block)
        content = (block_given?) ? capture(&block) : options.delete(:content)
              
        raise "You gotta specify a target id to register a hint bubble, baby."  unless target_id
        raise "You gotta provide content to register a hint bubble, baby."      unless content
                
        default_options = { :event_names => ["mouseover"], :position => "center right" }
        bubble_options  = [:content, :event_names, :before_show, :after_show, :before_hide, :after_hide].inject(default_options) do |h, k|
          h[k] = options.delete(k) if options.has_key?(k) 
          h
        end
        
        javascript_tag "MichaelHintbuble.HintBubble.instances['#{target_id}'] = new MichaelHintbuble.HintBubble('#{escape_javascript(content)}', #{bubble_options.to_json});"
      end
            
            
      # This method returns a Javascript string that will show the bubble attached to the supplied
      # target id.
      #
      def show_bubble(target_id)
        "MichaelHintbuble.Bubble.show('#{target_id}');"
      end
      
      
      # This method returns a Javascript string that will hide the bubble attached to the supplied
      # target id.
      #
      def hide_bubble(target_id)
        "MichaelHintbuble.Bubble.hide('#{target_id}');"
      end
      
    end
  end
end
