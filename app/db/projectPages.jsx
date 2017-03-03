import React from 'react';
import ExternalLink from 'app/components/ExternalLink';

export default {
    javascriptworkshops:
        <div>
            <h1>Workshops</h1>
            <h2>Basic Javascript</h2>
            <p className='project-data'>FALL 2016</p>
            <p>Over the course of several weeks, I led several workshops hour long workshops on basic Javascript.  The first was getting up and running with Node, and the second focused on a more fundamental principle - Object Oriented programming in Javascript.</p>
            <p><ExternalLink url='https://github.com/jcharry/JavaScript-Club-ITP-2016-2017'>Repository for workshops</ExternalLink></p>
            <h2>React</h2>
            <p>During ITP Unconference 2017 I led a several hour React workshop to teach the basics of JSX, transpiling with babel and bundling with webpack, and the beginnings of a basic react app.</p>
            <p><ExternalLink url='https://github.com/jcharry/React_Unconference_2017'>Repository for workshop</ExternalLink></p>
            <h2>VIM</h2>
            <p>My love of vim is no secret, so I also taught a workshop on VIM during the 2017 ITP Unconference.</p>
            <p><ExternalLink url='https://docs.google.com/presentation/d/19xVcA15k7yA4wWEz3LA2l7qjBQUCLKQkN5e2y4rE6w8/pub?start=false&loop=false&delayms=3000'>Presentation</ExternalLink></p>

        </div>,
    pds:
        <div>
            <h1>Digital Prints</h1>
            <p className='project-date'>ITP | FALL 2016</p>
            <h2>A Design for the word 'Tense'</h2>
            <p>Lines are drawn between nodes based on distance to give a non-regular connection pattern. The spiral inward attempts to create tension for the viewer.</p>
            <ExternalLink url='/images/projects/pds/pds0.png'><img src='/images/projects/pds/pds0.png' /></ExternalLink>
            <br />
            <br />
            <br />
            <h2>Generative Logo for the Tokyo 2020 Summer Games</h2>
            <p>Typically olympic logos stand alone and are not reusable across events or media. This logo attempts to be useable for general purposes, as well as for individual events. Each generation creates a randomized set of brush strokes that leave abstract forms open for interpretation. They do not tie to specific events, but the abstract nature of the forms encourages the viewer to see the sport in the stroke.</p>
            <p>The stroke was created through a simple, yet clever process. First a bezier path is drawn down the middle of the stroke.  Points along the path are sampled at regular intervals, and the stroke is extruded outward using normal vectors for direction.  The extrusion is finally scaled based on how far along the path it lies.</p>
            <ExternalLink url='/images/projects/pds/pds2.png'><img src='/images/projects/pds/pds2.png' /></ExternalLink>
            <br />
            <br />
            <br />
            <h2>Sol Lewitt - Wall Drawing</h2>
            <p>This recreation of a Sol Lewitt wall drawing uses Delaunay Triangulation to create an organic distribution of triangles.  A box packing algorithm is then used to pack several of these panels together to match the original.</p>
            <ExternalLink url='/images/projects/pds/pds3.png'><img src='/images/projects/pds/pds3.png' /></ExternalLink>
            <br />
            <br />
            <br />
            <h2>Book cover for Dune</h2>
            <p>I love dune, and the imagery in the novel is quite striking.  Strong colors and iconic imagery became the basis for this design.  The eye texture was generated through a 2D noise map, then masked with an eye-shaped path. Perlin Noise is used to generate the mountains in front.</p>
            <ExternalLink url='/images/projects/pds/pds1.png'><img src='/images/projects/pds/pds1.png' /></ExternalLink>
        </div>,
    brasslamp:
        <div>
            <h1>Brass, Walnut, and Cherry Lamp</h1>
            <p className='project-date'>ITP | SPRING 2016</p>
            <p>Made in equal parts on the wood lathe, a 4-axis mill, and at a desk with a tube cutter, this lamp was my first real dive into a fabrication product</p>
            <ExternalLink url='/images/projects/brasslamp/lamp0.jpg'><img src='/images/projects/brasslamp/lamp0.jpg' /></ExternalLink>
            <br />
            <br />
            <ExternalLink url='/images/projects/brasslamp/lamp1.jpg'><img src='/images/projects/brasslamp/lamp1.jpg' /></ExternalLink>
            <br />
            <br />
            <ExternalLink url='/images/projects/brasslamp/lamp2.jpg'><img src='/images/projects/brasslamp/lamp2.jpg' /></ExternalLink>
            <br />
            <br />
            <ExternalLink url='/images/projects/brasslamp/lamp3.jpg'><img src='/images/projects/brasslamp/lamp3.png' /></ExternalLink>
            <br />
            <br />
            <ExternalLink url='/images/projects/brasslamp/lamp4.jpg'><img src='/images/projects/brasslamp/lamp4.png' /></ExternalLink>
            <br />
            <br />
            <ExternalLink url='/images/projects/brasslamp/lamp5.jpg'><img src='/images/projects/brasslamp/lamp5.png' /></ExternalLink>
            <br />
            <br />
        </div>,
    sasscan:
        <div className='sasscan'>
            <h1>Sasscan</h1>
            <p className='project-date'>ITP | SPRING 2016</p>
            <p>A project by Jamie Charry & Dana Abrassart</p>
            <img src='/images/projects/sasscan/sasscan.gif'/>
            <p>How do you get people to think about their trash? How can you encourage them to be more diligent in handling their waste stream? Assault them at the source, of course. Sasscan attempts to bring awareness to waste by visually and auditorally berating the user after they've thrown something away.</p>

            <h2>See it in action</h2>
            <p>Video courtesy of <ExternalLink url='http://armchair.guru/'>Dana Abrassart</ExternalLink></p>
            <div className='video-wrapper'>
                <iframe src="https://player.vimeo.com/video/164219386" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
            </div>
            <p><a href="https://vimeo.com/164219386">sass/can</a> from <a href="https://vimeo.com/user13451363">Dana Abrassart</a> on <a href="https://vimeo.com">Vimeo</a>.</p>
            <br />
            <h2>Technologies</h2>
            <p>Sasscan simply uses a Raspberry Pi and a switch on the lid.</p>

        </div>,
    tale:
        <div className='tale'>
            <h1>Tale of &lt;user defined location&gt;</h1>
            <p className='project-date'>ITP | MAY 2016</p>
            <p>Leveraging a series of API's, this Flask application takes a geographical point as input and using it's coordinates collects information - including nearby places, weather, historic photos, and wikipedia entries - about that location.  The information is then run through a Tracery template to construct a summary of the place.</p>
            <h2>Screengrabs</h2>
            <p>The app is no longer online - api's change, servers cost money, but here's essentially how it worked</p>
            <ExternalLink url='/images/projects/tale/tale0.png'><img src='/images/projects/tale/tale0.png' />
</ExternalLink>
            <ExternalLink url='/images/projects/tale/tale1.png'><img src='/images/projects/tale/tale1.png' />
</ExternalLink>
            <ExternalLink url='/images/projects/tale/chappaqua.png'><img src='/images/projects/tale/chappaqua.png' />
</ExternalLink>
            <br/>
            <br/>
            <h2>Technology</h2>
            <p>Python backend, Leaflet based front end. Tracery was used for templating, and TextBlob was used for language analysis. Data collected from the following API's:</p>
            <ol>
                <li>Wikipedia</li>
                <li>NYPL Digital Collections</li>
                <li>Factual</li>
                <li>Google Cloud Vision (pull keywords from historic images)</li>
                <li>Open Weather Map</li>
                <li>UN Data</li>
                <li>NYTimes Article Search</li>
            </ol>
            <h2>Links</h2>
            <ExternalLink url='http://itp.jcharry.com/2016/05/05/756/'>ITP Blog Post</ExternalLink>
            <br />
            <ExternalLink url='http://tale.town'>Project link - No longer maintained, may be broken</ExternalLink>
        </div>,

    // What's In My Food //
    ingredients:
        <div className='ingredients'>
            <h1>What's In My Food?</h1>
            <p className='project-date'>ITP | JUL 2016</p>
            <p>Ever wonder what maltodextrin is and why its in your food? By simply taking a photo of an ingredients label, the user can explore what all those tricky ingredients are, where they come from, and why they're there in the first place.</p>
            <h2>Demo</h2>
            <div className='video-wrapper'>
                <iframe src="https://player.vimeo.com/video/175415250" width="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
            </div>
            <p><a href="https://vimeo.com/175415250">What&#039;s in my Food?</a> from <a href="https://vimeo.com/jcharry">jcharry</a> on <a href="https://vimeo.com">Vimeo</a>.</p>
            <h2>Technology</h2>
            <p>Node backend leveraging Google Cloud Vision for OCR. Phonegap for mobile app.</p>
            <h2>Links</h2>
            <ExternalLink url='http://itp.jcharry.com/2016/03/07/whats-in-my-food-midterm-presentation/'>Documentation</ExternalLink>
            <br />
            <ExternalLink url='http://itp.jcharry.com/2016/02/25/whats-in-my-food-pt-2-mockups/'>Mockups</ExternalLink>
            <br />
            <ExternalLink url='http://itp.jcharry.com/2016/02/23/whats-in-my-food-pt-1/'>Initial Explorations</ExternalLink>
        </div>,

    // History of the Cocoa Bean //
    "cocoa":
        <div className='cocoa'>
            <h1>An Interactive History of the Cocoa Bean</h1>
            <p className='project-date'>ITP | FEB 2016</p>
            <p>A slideshow style web page developed from scratch to educate folks about the humble cocoa bean. I wanted to try to implement simple transitions without leaning on libraries like jQuery for help.</p>
            <ExternalLink url='/images/projects/cocoa/cocoa0.png'><img src='/images/projects/cocoa/cocoa0.png' alt='a brief history of the cocoa bean'/></ExternalLink>
            <ExternalLink url='/images/projects/cocoa/cocoa1.png'><img src='/images/projects/cocoa/cocoa1.png' alt='a map of central america'/></ExternalLink>
            <ExternalLink url='/images/projects/cocoa/cocoa2.png'><img src='/images/projects/cocoa/cocoa2.png' alt='the conquistadors arrived'/></ExternalLink>
            <ExternalLink url='/images/projects/cocoa/cocoa3.png'><img src='/images/projects/cocoa/cocoa3.png' alt='a cocoa famer'/></ExternalLink>
            <br />
            <br />
            <h2>Technology</h2>
            <p>Pure javascript, html, css, no external libraries</p>

            <h2>Links</h2>
            <ExternalLink url='http://cocoa.jcharry.com'>Site</ExternalLink>
        </div>,

    // EAFUS //
    "eafus":
        <div className='eafus'>
            <h1>E(verything) A(dded to) F(ood) (in the) U(nited states)</h1>
            <p className='project-date'>ITP | JAN 2016</p>
            <p>There are almost 4000 ingredients added to processed food. The FDA keeps a list of all these additives called EAFUS (Everything Added to Food in the United States). This bot tweets that list. Should take about 6 months to get through.</p>
            <ExternalLink url='https://twitter.com/EafusBot'>Check it out</ExternalLink>
        </div>,

    plasmicreflections:
        <div className='plasmic-reflections'>
            <h1>Plasmic Reflections</h1>
            <p className='project-date'>ITP | DEC 2015 - Ella Dagan and Jamie Charry</p>
            <p>Blue Ribbon Winner at Makerfaire 2016!</p>
            <p>A unique and personal experience, the Plasmic Reflection mirror encourages the user to fully inhabit their body and mind.  Developed over the course of several weeks at NYU ITP, the mirror acts as an extension of the user's heartbeat, allowing them to enter a meditative place where they are invited to look inward, or find silence.  Ultimately, the experience is up to the viewer.</p>
            <div className='video-wrapper'>
                <iframe src="https://player.vimeo.com/video/149091016" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
            </div>
            <p><a href="https://vimeo.com/149091016">Plasmic Reflections</a> from <a href="https://vimeo.com/jcharry">jcharry</a> on <a href="https://vimeo.com">Vimeo</a>.</p>
            <h2>Technology</h2>
            <p>Arduino controlled lights and sounds</p>
            <h2>Links</h2>
            <ExternalLink url='http://itp.jcharry.com/2015/12/14/plasmic-reflections-final-documentation/'>Documentation</ExternalLink>
        </div>,

    quppled:
        <div className='quppled'>
            <h1>Quppled</h1>
            <p className='project-date'>SUMMER 2014</p>
            <p>Double dating, an app for swingers, whatever. This prototype was an opportunity to learn swift, while also theoretically providing an opportunity for couples to find an easier way to hang out. There's all kinds of dating apps, but not so many that address what happens after you've already found someone.  Hence, Quppled.</p>
            <div className='video-wrapper'>
                <iframe src='https://player.vimeo.com/video/151353179' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
            </div>
            <p><a href="https://vimeo.com/151353179">Quppled</a> from <a href="https://vimeo.com/jcharry">jcharry</a> on <a href="https://vimeo.com">Vimeo</a>.</p>
            <h2>Technologies</h2>
            <p>Swift, Parse (RIP)</p>
        </div>,
    qad:
        <div>
            <h1>Question a Day</h1>
            <p className='project-date'>ITP | DEC 2015</p>
            <p>In today's facebook flooded internet world, we're often inundated with other people's feelings. Ultimately people are looking to connect with one. Question a Day is a simple attempt to allow for the sharing of deep feelings, semi-anonymously, to encourage us to look beyond our own feelings and to connect with those of a stranger.</p>
            <ExternalLink url='/images/projects/qad/qad0.png'><img src='/images/projects/qad/qad0.png' /></ExternalLink>
            <ExternalLink url='/images/projects/qad/qad1.png'><img src='/images/projects/qad/qad1.png' /></ExternalLink>
            <ExternalLink url='/images/projects/qad/qad2.png'><img src='/images/projects/qad/qad2.png' /></ExternalLink>
            <br />
            <br />
            <h2>Technologies</h2>
            <p>p5, MLab (mongoDB), Node, some sentiment analysis</p>
            <h2>Links</h2>
            <ExternalLink url='http://questionaday.herokuapp.com'>No longer maintained Project Site</ExternalLink>
            <br/>
            <ExternalLink url='http://itp.jcharry.com/2015/12/01/public-question-a-day-final-documentation/'>ITP Documentation</ExternalLink>
        </div>,
    solarsynth:
        <div>
            <h1>Solar Synthesizer</h1>
            <p className='project-date'>ITP | OCT 2015</p>
            <p>Clicking around draws lines. When planets cross those lines, they make music. Sound fun? Done entirely in p5.js</p>
            <img src='/images/projects/solarsynth/solarsynth.gif' />
            <p>The planets, while simply styled, orbit in physically accurate proprotions (both in position and velocity).</p>
        </div>,
    colorflowers:
        <div>
            <h1>HSB Drawings</h1>
            <p>Just some experiments with HSB color space, and the canvas</p>
            <ExternalLink url='/images/projects/colorflowers/colorflowers0.png'><img src='/images/projects/colorflowers/colorflowers0.png' /></ExternalLink>
            <ExternalLink url='/images/projects/colorflowers/colorflowers1.png'><img src='/images/projects/colorflowers/colorflowers1.png' /></ExternalLink>
            <ExternalLink url='/images/projects/colorflowers/colorflowers2.png'><img src='/images/projects/colorflowers/colorflowers2.png' /></ExternalLink>
            <ExternalLink url='/images/projects/colorflowers/colorflowers3.png'><img src='/images/projects/colorflowers/colorflowers3.png' /></ExternalLink>
            <ExternalLink url='/images/projects/colorflowers/colorflowers4.png'><img src='/images/projects/colorflowers/colorflowers4.png' /></ExternalLink>
        </div>,
    artistcomp:
        <div>
            <h1>Artist Comparator</h1>
            <p className='project-date'>ITP | NOV 2015</p>
            <p>Using the Echonest API - compare two different artists catalogs on a number of different characterstics</p>
            <ExternalLink url='/images/projects/artistcomp/artistcompsquare.png'><img src='/images/projects/artistcomp/artistcompsquare.png' /></ExternalLink>
        </div>,
    particlesandwaves:
        <div>
            <h1>Particles and Waves</h1>
            <p className='project-date'>ITP | OCT 2015</p>
            <p>A very early p5 sketch to get a hold on object collision</p>
            <ExternalLink url='/images/projects/paw/paw.png'><img src='/images/projects/paw/paw.png' /></ExternalLink>
            <br />
            <br />
            <h2>Links</h2>
            <ExternalLink url='http://itp.jcharry.com/particlesAndWaves/'>Particles and Waves</ExternalLink><br />
            <ExternalLink url='http://itp.jcharry.com/2015/09/16/particles-and-waves-icm-assignment-2/'>Documentation</ExternalLink>
        </div>
};
