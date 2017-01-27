import React from 'react';
import {Link} from 'react-router';
import ExternalLink from 'app/components/ExternalLink';
import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/dist/light';
import js from 'highlight.js/lib/languages/javascript';
import vim from 'highlight.js/lib/languages/vim';
import html from 'highlight.js/lib/languages/xml';
import solarized from 'react-syntax-highlighter/dist/styles/solarized-dark';
import Latex from 'react-latex';

registerLanguage('javascript', js);
registerLanguage('vim', vim);
registerLanguage('html', html);

export default (
         <div>
            <img src="http://blog.jcharry.com/wp-content/uploads/2016/06/Screen-Shot-2016-06-26-at-6.47.23-PM-1024x485.png" alt="Screen Shot 2016-06-26 at 6.47.23 PM" width="1000" height="474" class="alignnone size-large wp-image-53" />
            <p>React is super cool.  So is MapboxGL.  So when I started working on a mapping project I thought to myself, "hey, this is a chance to kill two birds with one stone and grab a hold of both React and MapboxGL in one fell swoop.  But as I heedless charged forward, it became apparent relatively quickly that react and mapbox might not be the match made in heaven that I was hoping for.</p>

            <h2>Not an issue with the DOM</h2>
            <p>Libraries like d3, that like to have a chokehold on the DOM are pretty tricky to integrate into React nicely.  Since react freaks out when the DOM is updated outside of it's reactive walls, having an external library mess with the DOM becomes a no-no.  This isn't actually a problem with MapboxGL, since it all works on a canvas element (with a few containers, but once those containers are in place, they are never really changed, unless you decide to use Mapbox's popups, which I feel like can always be improved upon, so we can skip over those).  We can skirt around the DOM messiness by wrapping a MapboxGL map into a react component, and add a few methods to handle any Mapbox api calls that we want to make.  I'm using redux here as well.</p>

            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
import React from 'react';
import { connect } from 'react-redux';
import mapboxgl from 'mapbox-gl';

import * as actions from 'app/actions/actions';

class Map extends React.Component {
    componentDidMount() {
        // Any information the map needs can be passed down as a prop from the parent
        var { map } = this.props;

        // Store the map as a property on the class so we can call mapbox methods later
        mapboxgl.accessToken = 'YOUR_TOKEN_HERE';
        this.map = new mapboxgl.Map({
            container: containerId,
            style: 'mapbox://styles/mapbox/light-v9',
            center: [-74, 51],
            zoom: 8
        });

        this.map.on('load', () => {
            this.initMap();
        });
    }

    initMap() {
        // Initialize you're map here
        // i.e. if you want to load an overlays right away, etc.
    }

    // Wrap mapbox flyTo for easy accessibility
    // Grap map from the store which holds the position that our map should be at
    setMapPosition() {
        var { map } = this.props;
        this.map.flyTo({
            center: map.center,
            zoom: map.zoom,
            pitch: map.pitch || 0,
            bearing: map.bearing || 0
        });
    }

    render() {
        return (
            &lt;div id='map'&gt;&lt;/div&gt;
        );
    }
}

// Use connect to transform state to props (a redux thing)
export default connect((state) => {
    return {
        map: state.map,
        whereAmI: state.whereAmI
    };
})(Map);
`}</SyntaxHighlighter>

            <h2>But, why?</h2>
            <p>Great, we've wrapped a map up into a react component. Whoop-de-do.  Big deal.  So far we haven't utilized react for anything interesting.  What we really want is to hook into react's lifecycle methods.  That's where the power lies.  That's what it's good at.  Looking at state and taking action for us.  But there's an issue here.  MapboxGl is ultimately just a canvas element.  That's why it can render zoom levels of 4.3, or 8.2.  It's just drawing into a canvas, and react doesn't really give any good way to interact with a canvas, since, after all, what happens in the canvas is irrelevant to the DOM.  As far as the DOM is concerned, the canvas exists, and that's all it cares about.  So how do we utilize a library that is super good at rendering DOM elemnents, with a library that doesnt' really give the DOM a second thought?  And why would we want to do that?</p>

            <p>Well, if you're just building a simple map with some data on it, it's pretty pointless to use React.  But once you start buliding a web-app <em>around</em> a map, well then react comes in handy for just about everything else besides the map, so it makes sense to figure out how to get the two to talk to each other amicably.</p>

            <p>We press on.</p>

            <h2>Lifecycle updates</h2>
            <p>The goal is to get the map to react when the state changes.  In the code above, I left in a state variable called whereAmI, which I'm using to track what 'page' the user is on.  If the user clicks forward in the app, the map should update with new data, and a new position.  We can let react handle telling our Map component that it needs to update by utilizing componentDidUpdate.</p>
            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
...
componentDidUpdate(prevProps) {
    var { whereAmI, map } = this.props;

    // if the current map position doesn't match
    // what's in the store, then move back to the stored location
    if (map.center !== this.map.getCenter()) {
        this.setMapPosition();
    }

    // Upon initialization, when the user hasn't done anything
    // just set the map to it's home position
    if (whereAmI.position === 'none') {
        this.setMapPosition();
        return;
    }

    // If the user initialized a page, i.e. whereAmI.position isn't 'none',
    // then check what page we're on
    if (whereAmI.page === 0) {  // we're on the first page, initialize
        this.initPage();
    } else {    //  we're not on the first page!
        this.updatePage();    // update data as necessary
    }

    return;
}
`}</SyntaxHighlighter>

            <h2>Mapbox Sources and Layers</h2>
            <p>This is all well and good, but what happens when you want to start adding overlays to your map?  If you're not familiar with MapboxGL, it basically works by storing <code>sources</code> and <code>layers</code>.  Sources act as, just what they sound like, sources of data.  Typically they contain geojson data, but are not limited to it.  Sources do not display, they just store data.  Layers reference a source, then figure out how to display the source on the map.  You can have many different layers, all showing different things, from the same source, e.g. borders or fills.</p>

            <p>So as the user pages through the app, the data changes.  How do we handle this?  There's a few potential ways to go about this:</p>
            <ol>
                <li>Store all sources and layers in the store, with properties that tell the app what page they should display on</li>
                <li>Store only visible sources and layers in the store, that we we don't have to do any filtering in the Map component itself</li>
                <li>Lastly, don't store any sources or layers in the store, and instead store them as local properties on our Map class.</li>
            </ol>

            <p>The most <em>reacty</em> to handle this would probably be option number 1. or 2.  Let Redux store what needs to be displayed and all the Map is responsible for is displaying it.  But in the process of trying to do this, I found it get a little hairy.  It ends up looking something like this:</p>
            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
...
componentDidUpdate(prevProps) {
    var { whereAmI, map, overlays, dispatch } = this.props;

    // if the current map position doesn't match
    // what's in the store, then move back to the stored location
    if (map.center !== this.map.getCenter()) {
        this.setMapPosition();
    }

    // whereAmI changed, so update what overlays need to be visible
    // THIS IS BAD - REALLY HARD TO MANAGE
    dispatch(actions.addOverlay('some overlay', 'some data'));
... Ignore the other stuff below here for the moment
}
`}</SyntaxHighlighter>
        <p>Do you see the problem?  componentDidUpdate gets run when whereAmI changes, which then dispatches a new overlay to the redux store, which in turn triggers componentDidUpdate again.  In this case it's manageable if we use a few simple conditionals, but the possibility for endless updating, or even more likely just hard to reason about code, is super high.  There is probably a better paradigm to handle this sort of a situation, but I found that the easiest way was just to let the Map component handle it's own state.  It flies directly in the face of 'Stateless all the things' and 'One source of truth', but it works.  And to be honest, I find it not terribly hard to reason about because you don't have to consider the cascading updates that are possible when a component is updating itself via <code>dispatch</code>.</p>

        <p>Here's how I handled it.  The Map component simply holds all overlays (that is, sources and layers) in it's own internal array.  Each overlay is wrapped in a separate class, called PointsOverlay or PathOverlay, depending on the type of geojson data we have, and that class has properties to store what page that overlay should be visible on.  So instead of dispatching a new action when the component updates, we just look at where we are, filter through our list of overlays, then display the relevant ones.</p>
            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
this.overlays.forEach((overlay) => {
    if (overlay.layer.visibleOnPage === whereAmI.page && overlay.layer.associatedPosition === whereAmI.position) {
        overlay.showLayer();    // a class method that calls mapboxGL .setLayoutProperty() and set's it to visible
    } else {
        overlay.hideLayer();    // Sets layout property to 'none'
    }
});
`}</SyntaxHighlighter>

            <h2>So the paradigm is this:</h2>
            <p>Let react handle state affects the entire app, including all DOM elements, but let the Map component handle it's internal state and decide on it's own what to show and not show.  It's not necessarily 100% aligned to the react mentality, but react is new, and some old habits are still good, even if they're old.</p>

            <p>And the moral of the story is, if you're building something on your own, and you find a way to do something that might be a bit unorthadoxed or a bit frowned upon, if it works, and you understand it, and it doesn't smell super funny, then run with it!  What do you have to lose?</p>

            <h2>Happy mapping!</h2>
        </div>
);
