import React from 'react';
import ExternalLink from 'app/components/ExternalLink';

export default {
    brasslamp:
        <div>
            <h1>Brass, Walnut, and Cherry Lamp</h1>
            <p className='project-date'>ITP | SPRING 2016</p>
            <p>Made in equal parts on the wood lathe, a 4-axis mill, and at a desk with a tube cutter, this lamp was my first real dive into a fabrication product</p>
            <ExternalLink url='/images/lamp0.jpg'><img src='/images/lamp0.jpg' /></ExternalLink>
            <br />
            <br />
            <ExternalLink url='/images/lamp1.jpg'><img src='/images/lamp1.jpg' /></ExternalLink>
            <br />
            <br />
            <ExternalLink url='/images/lamp2.jpg'><img src='/images/lamp2.jpg' /></ExternalLink>
            <br />
            <br />
            <ExternalLink url='/images/lamp3.jpg'><img src='/images/lamp3.png' /></ExternalLink>
            <br />
            <br />
            <ExternalLink url='/images/lamp4.jpg'><img src='/images/lamp4.png' /></ExternalLink>
            <br />
            <br />
            <ExternalLink url='/images/lamp5.jpg'><img src='/images/lamp5.png' /></ExternalLink>
            <br />
            <br />
        </div>,
    sasscan:
        <div className='sasscan'>
            <h1>Sasscan</h1>
            <p className='project-date'>ITP | SPRING 2016</p>
            <p>A project by Jamie Charry & Dana Abrassart</p>
            <img src='/images/sasscan.gif'/>
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
            <ExternalLink url='/images/tale0.png'><img src='/images/tale0.png' />
</ExternalLink>
            <ExternalLink url='/images/tale1.png'><img src='/images/tale1.png' />
</ExternalLink>
            <ExternalLink url='/images/chappaqua.png'><img src='/images/chappaqua.png' />
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
            <ExternalLink url='/images/cocoa0.png'><img src='/images/cocoa0.png' alt='a brief history of the cocoa bean'/></ExternalLink>
            <ExternalLink url='/images/cocoa1.png'><img src='/images/cocoa1.png' alt='a map of central america'/></ExternalLink>
            <ExternalLink url='/images/cocoa2.png'><img src='/images/cocoa2.png' alt='the conquistadors arrived'/></ExternalLink>
            <ExternalLink url='/images/cocoa3.png'><img src='/images/cocoa3.png' alt='a cocoa famer'/></ExternalLink>
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
            <ExternalLink url='/images/qad0.png'><img src='/images/qad0.png' /></ExternalLink>
            <ExternalLink url='/images/qad1.png'><img src='/images/qad1.png' /></ExternalLink>
            <ExternalLink url='/images/qad2.png'><img src='/images/qad2.png' /></ExternalLink>
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
            <div className='video-wrapper'>
                <iframe src='http://itp.jcharry.com/solarSystem/' ></iframe>
            </div>
            <p>If it doesn't look great on your browser, here's the full link</p>
            <ExternalLink url='http://itp.jcharry.com/solarSystem'>Solar Synth</ExternalLink>
        </div>,
    colorflowers:
        <div>
            <h1>HSB Drawings</h1>
            <p>Just some experiments with HSB color space, and the canvas</p>
            <ExternalLink url='/images/colorflowers0.png'><img src='/images/colorflowers0.png' /></ExternalLink>
            <ExternalLink url='/images/colorflowers1.png'><img src='/images/colorflowers1.png' /></ExternalLink>
            <ExternalLink url='/images/colorflowers2.png'><img src='/images/colorflowers2.png' /></ExternalLink>
            <ExternalLink url='/images/colorflowers3.png'><img src='/images/colorflowers3.png' /></ExternalLink>
            <ExternalLink url='/images/colorflowers4.png'><img src='/images/colorflowers4.png' /></ExternalLink>
        </div>,
    artistcomp:
        <div>
            <h1>Artist Comparator</h1>
            <p className='project-date'>ITP | NOV 2015</p>
            <p>Using the Echonest API - compare two different artists catalogs on a number of different characterstics</p>
            <ExternalLink url='/images/artistcompsquare.png'><img src='/images/artistcompsquare.png' /></ExternalLink>
        </div>,
    particlesandwaves:
        <div>
            <h1>Particles and Waves</h1>
            <p className='project-date'>ITP | OCT 2015</p>
            <p>A very early p5 sketch to get a hold on object collision</p>
            <ExternalLink url='/images/paw.png'><img src='/images/paw.png' /></ExternalLink>
            <br />
            <br />
            <h2>Links</h2>
            <ExternalLink url='http://itp.jcharry.com/particlesAndWaves/'>Particles and Waves</ExternalLink><br />
            <ExternalLink url='http://itp.jcharry.com/2015/09/16/particles-and-waves-icm-assignment-2/'>Documentation</ExternalLink>
        </div>
};
