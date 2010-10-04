// ----------------------------------------------------------------------------
// Tooltip Constructor
// ----------------------------------------------------------------------------

var Tooltip = function(trigger, content, options) {
    options         = options || {};
    
    this._trigger       = $(trigger);
    this._element       = null;
    this._isShowing     = null;
    this._position      = options["position"] || "center right";
    this._positioner    = new Tooltip._Positioner();
    
    this._makeTooltip();
    this._initListeners();
    this.setContent(content);
    this.setPosition();
}

// ----------------------------------------------------------------------------
// Static Properties
// ----------------------------------------------------------------------------

Tooltip._POSITION_FN_MAP = $H({
    left:   "getWidth",
    top:    "getHeight"
});

// ----------------------------------------------------------------------------
// Instance Properties
// ----------------------------------------------------------------------------

Object.extend(Tooltip.prototype, {
    
    // Makes a new tooltip element.
    _makeTooltip: function() {
        if(!this._element) {
            this._element = 
                new Element("DIV", { "class": "tooltip" }).update(
                    new Element("DIV", { "class": "container" })
                );
            
            this._element.style.position = "absolute";
            this._element.hide();
            
            document.body.insert(this._element);
        }
    },
    
    // TODO: Move this positioning logic into the Tooltip._Positioner
    _reposition: function() {
        
        // Restore the element to its current position.
        this.setPosition();
        
        // Reposition if the element overruns the viewport.
        Tooltip._POSITION_FN_MAP.each(function(pair) {
            
            var method              = pair.last();
            var viewPortMinEdge     = document.viewport.getScrollOffsets()[pair.first()];
            var viewPortMaxEdge     = viewPortMinEdge + document.viewport[method]();
            var elementMinEdge      = parseInt(this._element.style[pair.first()] || 0);
            var elementMaxEdge      = elementMinEdge + this._element[method]();
            
            if(elementMaxEdge > viewPortMaxEdge) {
                this._positioner[pair.first()](this._trigger, this._element);
            } else if(elementMinEdge < viewPortMinEdge) {
                this._positioner[this._positioner.complement(pair.first())](this._trigger, this._element);
            }
            
        }.bind(this));
        
        this._updateContainerClasses();
    },
    
    _initListeners: function() {
        // Setup the mouse listener.
        this._trigger.observe("mouseover", function() {
            this.show();
        }.bind(this));
        
        this._trigger.observe("mouseout", function() {
            this.hide();
        }.bind(this));
        
        Event.observe(window, "resize", function() {
            this._reposition();
        }.bind(this));
    },
    
    _updateContainerClasses: function() {
        var container = this._element.down(".container");
        
        // clear any extra classes from the container
        container.className = "container";
        
        // Add the poisitioning class
        container.addClassName(this._positioner.styleClassForPosition());
    },
    
    // Sets the content of the Tooltip.
    setContent: function(content) {
        this._element.down(".container").update(content);
    },
    
    // Sets the position of the tooltip.  It should be noted that the position
    // simply states a preferred location for the tooltip within the viewport.
    // If the supplied position results in the tooltip overrunning the viewport,
    // the tooltip will be repositioned to avoid viewport overrun.
    setPosition: function(position) {
        if(position) {
            this._position = position.toLowerCase();
        }

        this._positioner.position(this._position, this._trigger, this._element);
        this._updateContainerClasses();
    },
    
    // Shows the tooltip.
    show: function() {
        new Effect.Appear(this._element, { 
            duration:       0.2,
            beforeStart:    function() {
                this._reposition();
            }.bind(this),
            afterFinish:    function() {
                this._is_showing = true;
            }.bind(this)
        });
    },
    
    // Hides the tooltip.
    hide: function() {
        new Effect.Fade(this._element, { 
            duration:       0.2,
            afterFinish:    function() {
                this._is_showing = false;
            }.bind(this)
        });
    },

    // Indicates whether the tooltip is showing.
    is_showing: function() {
        return this._is_showing;
    }
});

// ----------------------------------------------------------------------------
// Tooltip._Positioner Constructor
// ----------------------------------------------------------------------------
Tooltip._Positioner = function() {
    this._axis      = -1;
    this._position  = [];
}

// maps complement positions to one another.
Tooltip._Positioner.COMPLEMENTS = {
    left:   "right",
    right:  "left",
    top:    "bottom",
    bottom: "top"
};

// X and Y axis constants.
Tooltip._Positioner.X_AXIS = 0;
Tooltip._Positioner.Y_AXIS = 1;

// maps layout positions to axes.
Tooltip._Positioner.AXIS_MAP = {
    left:   Tooltip._Positioner.X_AXIS,
    right:  Tooltip._Positioner.X_AXIS,
    top:    Tooltip._Positioner.Y_AXIS,
    bottom: Tooltip._Positioner.Y_AXIS
};

Object.extend(Tooltip._Positioner.prototype, {
    position: function(pos, trigger, element) {
        pos = pos.split(/\s+/);
        
        // Center is always a secondary position.
        if(pos[0] === "center") pos.reverse();
        
        this._position = pos;
        
        // Set the axis
        this._axis = Tooltip._Positioner.AXIS_MAP[this._position[0]];
        
        // call the positioning methods for each position.
        this._position.each(function(e) { this[e](trigger, element); }.bind(this));
   
    },
    
    // Centers the tooltip with respect to the axis derived from the sibling positioning
    // instruction.
    center: function(trigger, element) {
        if(this._axis === -1) {
            throw "A layout axis could not be derived.";
        }
        
        var triggerPos = trigger.positionedOffset();
        
        if(this._axis === Tooltip._Positioner.Y_AXIS) {
            element.style.left = ((triggerPos.left + trigger.getWidth() / 2) - element.getWidth() / 2) + "px";
        } else if(this._axis === Tooltip._Positioner.X_AXIS) {
            element.style.top = ((triggerPos.top + trigger.getHeight() / 2) - element.getHeight() / 2) + "px";
        }
    },
    
    // Postions the tooltip to the left of the trigger element.
    left: function(trigger, element) {
        element.style.left = (trigger.positionedOffset().left - element.getWidth()) + "px";
    },
    
    // Postions the tooltip to the right of the trigger element.
    right: function(trigger, element) {
        element.style.left = (trigger.positionedOffset().left + trigger.getWidth()) + "px";
    },
    
    // Postions the tooltip above the trigger element.
    top: function(trigger, element) {
        element.style.top = (trigger.positionedOffset().top - element.getHeight()) + "px";
    },
    
    // Postions the tooltip below the trigger element.
    bottom: function(trigger, element) {
        element.style.top = (trigger.positionedOffset().top + trigger.getHeight()) + "px";
    },
    
    // Returns the name of the supplied position's complement position.
    complement: function(position) {
        return Tooltip._Positioner.COMPLEMENTS[position];
    },
    
    styleClassForPosition: function() {
        return this._position.sort().join("-").camelize();
    }
});