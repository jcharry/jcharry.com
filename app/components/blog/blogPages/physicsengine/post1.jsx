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
        <div itemProp='articleBody'>
                <h1>Building a Physics Engine, Pt. 1 - The Why</h1>
                <p className='post-date'>Dec 28, 2016</p>
                <p>If there's one thing we can all agree on it's that physics is really, really awesome. Now that we're all on the same page, let's get right to the point</p>
                <p>In my striving to build a digital science lab, I quickly realized that I'd need a physics engine underpinning the whole thing.  I wanted objects to interact in a psuedo scientifically accurate way, and for that I'd need a system to keep track of objects and their interactions.  So what better tool than a physics engine?  After digging around, I found a handful of seemingly well made engines</p>
                <ol>
                    <li><a href='http://brm.io/matter-js/'>Matter.js</a></li>
                    <li><a href='http://www.cannonjs.org/'>Cannon.js</a></li>
                    <li><a href='http://wellcaffeinated.net/PhysicsJS/'>PhysicsJs</a></li>
                    <li><a href='http://box2d-js.sourceforge.net/'>Box2DJS</a></li>
                </ol>

                <p>I guess you could say 'glutton for punishment', or 'why reinvent the wheel!?', but as I poked around these, I had the thought, 'hey, I could build one of these things'.  And so I decided to tred a well worn path and build my own physics engine.  The ultimate effort may not be fruitful in that I probably won't build as good of an engine as any of those listed above, but the benefits to me are plenty:</p>
                <ol>
                    <li>Really up my programming skills</li>
                    <li>Get a chance to apply my undergrad physics degree</li>
                    <li>Get a chance to work on a complicated system rather than a one off application</li>
                    <li>Learn how to build a library designed to be used in other applications</li>
                    <li>And generally get to have fun thinking about science</li>
                </ol>

                <p>So over the next few months, I'll be documenting my progress as I work through building out this engine, and ultimately use it to build a digital science lab meant to encourage enthusiam and experimentation with regards to not just physics, but science as a whole.  Stay tuned.</p>
            </div>
);
