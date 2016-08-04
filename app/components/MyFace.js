var profileSrc = require('app/images/profile_clipped.png');
import * as actions from 'app/actions/actions';
import Tween from 'app/lib/Tween';

/**********************************
 *
 *  MyFace is literally, my face
 *  in a ball that rolls around the site
 *
 *  It's fundamentally a PIXI sprite object
 *  which means it's lifecycle is managed
 *  outside React.  It needs to dispatch 
 *  one action, though - when it's clicked
 *  so that it can open the fan display
 *
 *  It's not meant to be modular, it's a messy
 *  class that houses a lot of tedious
 *  animations and tweens, and it can only
 *  really interact with the parent Canvas
 *  component.
 *
 *  Things to know:
 *      The animation loop is handled in the 
 *      Canvas component, so there's a reference
 *      to an array of tweens that the Canvas looks
 *      through to figure out if any things needs
 *      to be animated. That array lives on the Canvas
 *      Component for now.  Ideally it would exist
 *      in a separate TWEENS instance. Everything else
 *      here is pretty simple, except that dispatch
 *      needs to be passed down from the parent component
 *      so that the rest of the app can respond to click
 *      events
 *
 **********************************/
export default class MyFace {
    constructor(container, parent, dispatch) {
        this.dispatch = dispatch;
        this.idleTime = 0;
        this.timeToShake = 300;
        this.tweens = parent;
        this.container = container;
        this.currentPage = 'home';

        this.sprite = new PIXI.Sprite.fromImage(profileSrc);
        this.sprite.height = this.setSpriteSize();
        this.sprite.width = this.setSpriteSize();
        this.sprite.x = 0;
        this.sprite.y = -300;
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.interactive = true;

        this.container.addChild(this.sprite);

        this.isShaking = false;
        this.rotationDir = 1;

        this.mouseOver = this.mouseOver.bind(this);
        this.mouseOut = this.mouseOut.bind(this);
        this.mouseDown = this.mouseDown.bind(this);
        window.me = this;
    }

    setSpriteSize() {
        // Step function - on small screens
        var ww = window.innerWidth;
        return 200;
        //if (ww > 1000) {
            //return 200;
        ////} else if (ww > 500) {
            ////return 200;
        //} else {
            //return 200;
        //}
    }

    mouseDown(e) {
        e.stopPropagation();
        console.log('clicked my face');

        switch (this.currentPage) {
            case 'home':
                this.dispatch(actions.toggleFanDisplay());
                break;
            case 'Projects':
                this.dispatch(actions.currentPage('home'));
                break;
            case 'Me':
                this.dispatch(actions.currentPage('home'));
                break;
            default:
                break;
        }
    } 

    mouseOver(e) {
        if (!this.isShaking) {
            this.isShaking = true;
        
            this.shake();
        }
    }

    mouseOut() {
        //this.sprite.scale.x = this.sprite.scale.x / 1.1;
        //this.sprite.scale.y = this.sprite.scale.y / 1.1;
    }

    // Animation that runs on page load
    // My Face bouncing into the center of page
    enter() {
        var that = this;
        var yTween = new Tween(this.tweens)
            .duration(1900)
            .easing('easeOutBouce')
            .start({ y: 0 })
            .end({ y: window.innerHeight / 2 });
        var xTween = new Tween(this.tweens)
            .duration(2000)
            .easing('none')
            .start({ x: 0 })
            .end({ x: window.innerWidth / 2 });
        var rotTween = new Tween(this.tweens)
            .duration(2000)
            .start({ rotation: 0 })
            .end({ rotation: Math.PI * 2 })
            .complete(() => {
                that.sprite.rotation = 0;
                that.sprite.on('mouseover', that.mouseOver);
                that.sprite.on('mouseout', that.mouseOut);
                that.sprite.on('mousedown', that.mouseDown);
                that.sprite.on('touchstart', that.mouseDown);
            });

        this.tweens.push(yTween);
        this.tweens.push(xTween);
        this.tweens.push(rotTween);
    }

    // Looks like more code than it is, 
    // just blows up because of how Tweens are instantiated
    // Shakes the face around a bit
    shake() {
        var tweensArr = this.tweens;

        var lastTween = new Tween(this.tweens)
            .duration(100)
            .start({ rotation: -(Math.PI * 1/32) })
            .end({ rotation: Math.PI / 32 });
        var secondTween = new Tween(this.tweens)
            .duration(100)
            .start({ rotation: Math.PI / 32 })
            .end({ rotation: -2*(Math.PI / 32) })
            .complete(() => {
                tweensArr.push(lastTween);
            });
        var firstTween = new Tween(this.tweens)
            .duration(100)
            .start({ rotation: 0 })
            .end({ rotation: Math.PI / 32 })
            .complete(() => {
                tweensArr.push(secondTween);
            });

        tweensArr.push(firstTween);

        this.sprite.scale.x = this.sprite.scale.x * 1.05;
        this.sprite.scale.y = this.sprite.scale.y * 1.05;
        this.isShaking = true;
        var that = this;
        setTimeout(() => {
            that.sprite.scale.x = that.sprite.scale.x / 1.05;
            that.sprite.scale.y = that.sprite.scale.y / 1.05;
            that.isShaking = false;
        }, 900);
    }

    // Position my face for the Projects Page
    projectsPage() {
        var x = this.sprite.x;
        var y = this.sprite.y;
        var xDist = window.innerWidth / 2 - x;
        //var yDist = window.innerHeight - y;
        var yDist = window.innerHeight /2 + 100;
        var startScale = this.sprite.scale.x;
        var finalScale = this.sprite.scale.x * 0.5;
        var scaleDist = finalScale - startScale;

        var scaleTween = new Tween(this.tweens)
            .duration(1000)
            .start({ scale: startScale })
            .end({ scale: scaleDist })
            .easing('easeInOutQuad');
        var projectsPageTween = new Tween(this.tweens)
            .duration(1000)
            .start({ x, y })
            .end({ x: xDist, y: yDist })
            .easing('easeInOutQuad')
            .complete(() => {
                console.log('tween done');
            });

        this.tweens.push(projectsPageTween);
        this.tweens.push(scaleTween);
    }

    // Position my face for the Me page
    mePage() {
        var x = this.sprite.x;
        var y = this.sprite.y;
        var finalX = 100;
        var finalY = -100;
        var startScale = this.sprite.scale.x;
        var finalScale = this.sprite.scale.x * 0.5;
        var scaleDist = finalScale - startScale;
        // Distance to move to the center of the page
        //var xDist = finalX - x;
        var xDist = 0;
        var yDist = finalY - y;
        var mePageTween = new Tween(this.tweens)
            .duration(1000)
            .start({ x, y })
            .end({ x: xDist, y: yDist})
            .easing('easeInOutQuad')
            .complete(() => {
                console.log('tween done');
            });

        var scaleTween = new Tween(this.tweens)
            .duration(1000)
            .start({ scale: startScale })
            .end({ scale: scaleDist })
            .easing('easeInOutQuad');

        this.tweens.push(mePageTween);
        this.tweens.push(scaleTween);
    }

    // Home page face position
    homePage() {
        // Where is the sprite right now?
        var x = this.sprite.x;
        var y = this.sprite.y;

        // Distance to move to the center of the page
        var xDist = window.innerWidth / 2 - x;
        var yDist = window.innerHeight / 2 - y;

        var startScale = this.sprite.scale.x;
        var finalScale = 0.2;
        var scaleDist = finalScale - startScale;

        var homePageTween = new Tween(this.tweens)
            .duration(1000)
            .start({ x: x, y: y })
            .end({ x: xDist, y: yDist })
            .easing('easeInOutQuad')
            .complete(() => {
                console.log('tween done');
            });

        var scaleTween = new Tween(this.tweens)
            .duration(1000)
            .start({ scale: startScale })
            .end({ scale: scaleDist })
            .easing('easeInOutQuad');

        this.tweens.push(homePageTween);
        this.tweens.push(scaleTween);
    }
}

