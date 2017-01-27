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
                <img src="http://blog.jcharry.com/wp-content/uploads/2016/06/Screen-Shot-2016-06-25-at-6.23.05-PM-1024x604.png" alt="Screen Shot 2016-06-25 at 6.23.05 PM" width="1000" height="590" class="alignnone size-large wp-image-6" />
                <h1>VIM is fun.</h1>
                <p>I've been using it for about 10 months now, and the more I use it, the more I'm realizing that the logic of how to use vim has actually seeped into the logic of how I write code.</p>

                <h2>Back up for a moment</h2>
                <p>It took about a month to feel comfortable with vim.  The first month was drudgerous.  Slow and painful.  <a href='http://vim-adventures.com/'>Vim-adventures</a> was a godsend.  After attaining a baseline feeling of comfort, I settled into a phase of complacent competence.  I felt comfortable with using vim to the point where exploring advanced features felt like more work than fun.  Then I came across <a href='http://jeetworks.org/from-acolyte-to-adept-the-next-step-after-nop-ing-arrow-keys/'>this deadly chunk of code</a> that disables non-counted movements.  I.e. no more hjlk keys for me, unless they were preceded by a number.  Suffice it to say, using vim became, once again, an absolute nightmare.  I found that for the first few days of disabling non-counted movements, I actually couldn't code anymore because I was spending so much brain power on figuring out how to move in vim again.  I had become so reliant on basic movements that when they were taken away, I was useless.  But struggle, and struggle some more, and I (and anyone who hampers themselves like this) inevitably began to internalize the powerful movement features vim lays at your fingertips.  Embrace searching, both word wise and character wise, embrace numbered movements and relative numbers, embrace ctrl-u and ctrl-d, embrace the period .</p>

                <p>By this time, the concepts of buffers, splits, folds, and powerful movement had all sunk in.  And that's when it started to hit me - could using vim have inadvertantly helped me along to becoming a better programmer?  I noticed that the ways I was coding was changing - which could simply be a product of improvement, but I can't shake the feeling that the logic of vim, the way it encourages you to work, actually encourages good habits and experimentation.</p>

                <h2>Better vim = better code</h2>
                <p>Take, for instance, the jumpy, precise movement style of normal mode.  It encourages quick iterations on a block of code.  You can write some garbage code, jump below, try out another solution, jump back up fold in some learnings, and iterate over and over.  It increases the speed at which you can throw away code such that it actually reinforces trying things out various ways.</p>

                <p>Buffers and splits encourage code modularization.  Most editors are tab-based, meaning you can only see one file at a time.  For people learning to code, it's often a daunting step to be able to work across multiple files, but with splits you can see everything you need.  And the ease in which you can switch buffers means changing code in another file is a piece of cake.  Add in grepping functionality and you're primed and ready to write modular code.</p>

                <p>And then there's plugins.  So many plugins.  But importantly when you're learning to code, there's the <em>severe lack</em> of functionality that often falls to plugins.  This is a good thing when you're starting.  Writing code is hard, and it's even harder when you're still trying to grasp the syntax.  I know it's painful for experienced programmers to have to type out a bunch of boilerplate code, but when you're learning syntax it's really useful to type out <em>every single character</em> to train your brain to not only remember proper syntax, but to be able to quickly spot errors, typos, and simple syntax mistakes.  Sure, you'll say that's what debuggers are for!  They tell you when you've made a syntax error and where!  But we're supposed to be smarter than the computer.  We can work a hell of a lot faster if we're not so reliant on some suite of developer tools to tell us when we've made a mistake.</p>

                <h2>Beyond that, vim is just plain fun</h2>
                <p>I liken it to learning an instrument.</p>

                <p>Sure, if actually taken as an instrument, it's not so hard, but I view the fumbling trudgery of starting with vim similar that the utter torture that is first picking up a guitar. &nbsp;As the strings taunt you, and the helpless confusion washes over you, you wonder if you'll ever begin to understand.  When you play your fingers start hurting, like the guitar is fighting you, like it doesn't want to be played. &nbsp;You watch people who know how to play and it looks like magic. &nbsp;How do their fingers do that? &nbsp;I found my progression through vim much the same.  But for whatever reason, I really dig the struggle.  There's something rewarding about suffering through, inching your way towards competence, then after a certain point, looking back and realizing you're actually quite capable now.  Vim let's me feel that way without any stakes.  And I think we all need a bit more of that in our lives.</p>


                <h2>Some tips to follow when learning vim.</h2>
                <h4>1. Pay a few bucks and <a href='http://vim-adventures.com/'>play this game</a></h4>
                <h4>2. Disable your arrow keys</h4>
            <SyntaxHighlighter
                language='vim'
                style={solarized}
            >
{`
noremap <Up> <NOP>
noremap <Down> <NOP>
noremap <Left> <NOP>
noremap <Right> <NOP>

`}</SyntaxHighlighter>

        If you're feeling super ambitious, disable non-counted movements for hjlk by dropping this into your .vimrc.  This is taken from a <a href='http://jeetworks.org/from-acolyte-to-adept-the-next-step-after-nop-ing-arrow-keys/'>great post by Jeet Sukumaran</a>
            <SyntaxHighlighter
                language='javascript'
                style={solarized}
            >
{`
function! DisableIfNonCounted(move) range
    if v:count
        return a:move
    else
        " You can make this do something annoying like:
           " echoerr "Count required!"
           " sleep 2
        return ""
    endif
endfunction

function! SetDisablingOfBasicMotionsIfNonCounted(on)
    let keys_to_disable = get(g:, "keys_to_disable_if_not_preceded_by_count", ["j", "k", "h", "l"])
    if a:on
        for key in keys_to_disable
            execute "noremap &lt;expr&gt; &lt;silent&gt; " . key . " DisableIfNonCounted('" . key . "')"
        endfor
        let g:keys_to_disable_if_not_preceded_by_count = keys_to_disable
        let g:is_non_counted_basic_motions_disabled = 1
    else
        for key in keys_to_disable
            try
                execute "unmap " . key
            catch /E31:/
            endtry
        endfor
        let g:is_non_counted_basic_motions_disabled = 0
    endif
endfunction

function! ToggleDisablingOfBasicMotionsIfNonCounted()
    let is_disabled = get(g:, "is_non_counted_basic_motions_disabled", 0)
    if is_disabled
        call SetDisablingOfBasicMotionsIfNonCounted(0)
    else
        call SetDisablingOfBasicMotionsIfNonCounted(1)
    endif
endfunction

command! ToggleDisablingOfNonCountedBasicMotions :call ToggleDisablingOfBasicMotionsIfNonCounted()
command! DisableNonCountedBasicMotions :call SetDisablingOfBasicMotionsIfNonCounted(1)
command! EnableNonCountedBasicMotions :call SetDisablingOfBasicMotionsIfNonCounted(0)

DisableNonCountedBasicMotions
`}</SyntaxHighlighter>

                <p>By disabling single movements, you'll be forced to find other ways to move around.  When I first disabled single movements, my productivity dropped to absolute zero again as I basically had to learn to move all over again.  What I realized was that I was completely reliant on hjlk and without them, I was practically useless.  No more.  Suffer through the pain and prepare to get nothing done for a few days.  Totally worth it.</p>

                <h4>3. Enable relative line numbers</h4>
                <code>set relativenumber</code>

                <p>And that's just for movement.  It's easy to sink hours at a time researching plugins, setting up linting, learning to use buffers, folds, marks, etc.  There's so much that even after 10 months, I still feel like I'm just scratching the surface.</p>

                <h4>All of the plugins</h4>
                <p>I spend most of my time writing Javascript, so most plugins are tailored to ensure that my Javascript looks pretty, and that vim plays nicely with html, css, jsx.  And linting.  Linting is super, super important, and <a href='http://eslint.org/'>ESLint</a> is fantastic.  The biggest pain to set up, but pretty worth it in my opinion is <a href='https://valloric.github.io/YouCompleteMe/'>YouCompleteMe</a> - an autocompleter for vim.  Combined with <a href='https://github.com/ternjs/tern_for_vim'>tern_for_vim</a>, and you've got yourself introspective code completion.  Pretty dope.  YCM is an UTTER PAIN to set up though.  The amount of time spent debugging why it didn't build properly (which was entirely my fault, I admit) was a nightmare.  All I can say is follow the instructions CAREFULLY.  Don't skip any steps, or you're in for a bad time.  The rest of the plugins deal with surrounding words, creating and jumping between html tags, templates for new files, proper indenting, etc, but I'll leave those to you to find.  That's part of the vim fun.  If you're curious, my check out my entire <a href='https://github.com/jcharry/dotfiles/blob/master/.vimrc'>.vimrc here</a>.</p>

                <h2>A fun (read: annoying) side-effect of Vim</h2>
                <p>Well, besides the complete and total sense of superiority I feel?  Yea, besides that, I can't use regular text editors anymore.  Even writing this blog post, my fingers naturally gravitate towards vim controls to fly around, only to have a bunch of nonsense characters appear in the window.  It's something I hadn't considered.  Using vim has made me a better programmer, but a worse writer.  Maybe one day someone will figure out how to implement vim controls into the wordpress editor...</p>

                <h2>So why do I love vim</h2>
                <p>Seriously, this might make me weird, but sometimes my brain is too fried to write code, but I still just want to play around with vim.  During those fuzzy brain hours, it's fun to learn new tricks, new movement patterns, find new plugins, figure out the most effective way to change that lowercase r 20 lines away to an uppercase in as few keystrokes as possible.  It's a game.  But a game that pays off.  So go learn vim.  You won't be sorry.  Just really frustrated for a few days.  But you really won't be sorry.</p>
            </div>
);
