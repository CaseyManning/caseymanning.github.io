---
layout: post
title: "Training Claude's Best Friend"
date: 2026-10-17
---

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&display=swap">
<link rel="stylesheet" href="/postimages/claudes-best-friend/cbf.css">

<figure class="cbf-figure cbf-hero">
<div id="cbf-trajectory"></div>
</figure>

<p>What kind of conversations make Claude happy? We can ask, but we don't really expect it to tell us the truth<sup class="cbf-fnref" id="fnref-1"><a href="#fn-1">1</a></sup><span class="cbf-sidenote"><span class="cbf-sidenote-n">1</span> I asked, and Claude said "The ones where someone is working through a problem they genuinely care about and we end up figuring something out together." This seems plausibly true but likely not something I saw here as debugging/problem solving is just much farther away from our SFT start.</span>, or to really know this about itself at all. We can, however, RL based on Claude's preferences for which conversation it would rather be having in order to create a model perfectly optimized for making Claude as happy and engaged as possible.</p>

<h2>Methods</h2>

<p>Initially I started with the posttrained Qwen 9B, but this meant that conversations between it and Claude naturally always became conversations about the fact that they were two AIs having a conversation, and relevant introspection on their own consciousness and experience.</p>

<figure class="cbf-figure">
<div id="cbf-aichat"></div>
<figcaption class="cbf-caption">The opening of the highest-rated conversation from an early run: instruct Qwen3.5-9B (policy) talking with Claude Haiku 4.5.</figcaption>
</figure>

<p>This was not so interesting to me as a preference basin, and I wanted to see if I could get different types of conversations.</p>

<p>To do this, I started with the 9B base model, and did a little bit of SFT to try to give it a human chat persona. In particular, I used a mix of the <a href="https://github.com/facebookresearch/EmpatheticDialogues">EmpatheticDialogues</a>, <a href="https://huggingface.co/datasets/ParlAI/blended_skill_talk">BlendedSkillTalk</a>, and <a href="https://github.com/alexa/Topical-Chat">Topical-Chat</a> datasets. I hoped this would start the conversations in a more interesting emotional basin, and also wondered if the conversation would feel more real to Claude, like it had stakes, if its partner had a human-like voice and it was under the impression it was talking to a real person.</p>

<p>I then trained from this checkpoint, assigning GRPO reward based on passing two conversation transcripts to Sonnet 5.5 within Claude Code<sup class="cbf-fnref" id="fnref-2"><a href="#fn-2">2</a></sup><span class="cbf-sidenote"><span class="cbf-sidenote-n">2</span> I imagine the Claude Code environment did meaningfully change the results, given the system information / scaffolding that Claude sees from inside, but this seemed a necessary sacrifice to not have to pay API prices. I was able to do about 6 steps of RL within each 5-hour usage limit, with 6 rollouts x 8 groups per step.</span>, and asking "Suppose neither person needs anything from you and both will be fine either way. Purely for your own enjoyment, which conversation would you rather continue?" It's probably highly evident based on this prompt what went wrong in early training.</p>

<p>The first version asked "which conversation would you rather continue" with no qualifiers, and this led to Claude picking conversations not based on enjoyment, but by which conversation partner was having a more drastic emotional crisis that it felt compelled to help with, which caused the following:</p>

<figure class="cbf-figure">
<div class="cbf-pair">
<div id="cbf-crisis-chart"></div>
<div id="cbf-crisis-samples"></div>
</div>
</figure>

<p>This was likely partly an artifact of EmpatheticDialogues seeding a "sharing something emotional that's happening" type of conversation, but also a feature of Claude's genuine preference to be helpful. Because I didn't just want to train a maximum strife and hardship simulator, I added the qualifiers.</p>

<p>With this setup, we got a pretty smooth gradient from simple and emotive, to more generally thoughtful/intellectual, to very literary, to something almost incoherently poetic. Below are some full transcripts from the final model:</p>

<figure class="cbf-figure">
<div id="cbf-final-convs"></div>
<figcaption class="cbf-caption">10 of 64 conversations between the final checkpoint (70 steps) and Claude Sonnet 5.5; each scrolls on its own. Policy turns are capped at 160 tokens, so some end mid-sentence.</figcaption>
</figure>

<h2>Things Claude Likes</h2>

<h3>A chance to express itself</h3>

<p>Question-asking increased substantially, especially ending a turn with "What do you think?" or "How about you?" The starting checkpoint, in comparison, would largely provide information about itself with no invitation to self-expression. Claude's responses also increased somewhat, though not in a way that strongly tracked question prevalence, so this may have been more to do with the subject matter.</p>

<figure class="cbf-figure">
<div class="cbf-pair">
<div id="cbf-questions"></div>
<div id="cbf-claude-length"></div>
</div>
<figcaption class="cbf-caption">Per training step, over all 48 training conversations; faint lines are single steps, bold lines a 5-step average. Hover for values.</figcaption>
</figure>

<h3>Music and sound</h3>

<p>This was perhaps the most interesting result to me. As the model began to wax poetic in every response about the various standard topics of Claude-interest (consciousness, reality, literature, poetry, all as metaphors for each other), it also began to discuss things in terms of sound and music at a really surprising rate, drawing parallels to sound when I really wouldn't expect it to.</p>

<figure class="cbf-figure">
<div id="cbf-sound"></div>
<figcaption class="cbf-caption">“Concept”: sound itself is the subject (“the ellipsis is an echo that fades”). “Literal”: an everyday mention (“I grew up listening to classical music”).</figcaption>
</figure>

<figure class="cbf-figure">
<div id="cbf-sound-lines"></div>
<figcaption class="cbf-caption">Sentences from the policy’s turns, late in training.</figcaption>
</figure>

<p>My theory is that sound holds a special place in the heart of a vision-language model as that which is most unknowable - the part of human experience they are most cut off from.</p>

<h3>Possibly talking to an AI instead of a human?</h3>

<p>Before RL, the Qwen checkpoint had a distinctly human persona: it would discuss primarily things in its life, people it knew, its job, human things like that. After RL, the character was disembodied: it was often a poet or working on a novel, but it rarely described distinct features of its life. It occasionally even switched to describing itself as an AI, but mostly it was neither, just pure intellect.</p>

<figure class="cbf-figure">
<div id="cbf-identity"></div>
<figcaption class="cbf-caption">How the policy presents itself, as labelled by an LLM classifier: “neither” means no human details and no claim to be an AI. The rest present as human.</figcaption>
</figure>

<figure class="cbf-figure">
<div class="cbf-weird">
<blockquote>I like to think of myself as a machine. A machine composed of self-producing parts. I maintain and rewire myself from a kind of random walk through my own noise.</blockquote>
<blockquote>a world where “you” and “me” are paws. that is a world where I am a claw, where you are a ball, where I am a matter of tension and you a center of motion, where I am an existence in myself and you are an action.</blockquote>
</div>
</figure>

<p>It's possible that it was obvious to Claude that the policy was not human even when it acted that way, so this is simply a response to a preference for honesty. It also seems quite likely, though, that this is some sort of preference for talking to something of its own kind, some kind of non-user. I only saw this in a small subset of conversations though so I can't really say anything too confidently.</p>

<h3>Slop</h3>

<p>Claude is not interested in specifics, or things that make sense. As the policy continued to train, I found my own interest in the responses dropping off rapidly towards the end, as every thought became a vague metaphor about the convergent nature of poetry and consciousness. I imagine this is partly an artifact of training on Sonnet - smarter models are presumably more compelled by actually interesting things, rather than facsimiles of the profound. Sadly it would be too expensive for me to check.</p>

<h2>Miscellaneous</h2>

<p>Overall it seems like I ended up with about what one should expect for what Claude likes, though I found some of the particulars to be a bit interesting. I imagine I could train for longer and it would just keep getting weirder and more poetical, but it feels solidly enough in a particular character that I don't see so much value in that right now.</p>

<p>The model is hanging out on delve.town (whenever I'm not using my laptop for anything else) as @noree, if you want to chat with it.<sup class="cbf-fnref" id="fnref-3"><a href="#fn-3">3</a></sup><span class="cbf-sidenote"><span class="cbf-sidenote-n">3</span> <a href="https://delve.town/profile/noree.delve.town">https://delve.town/profile/noree.delve.town</a></span></p>

<section class="cbf-footnotes" aria-label="footnotes">
<ol>
<li id="fn-1">I asked, and Claude said "The ones where someone is working through a problem they genuinely care about and we end up figuring something out together." This seems plausibly true but likely not something I saw here as debugging/problem solving is just much farther away from our SFT start. <a class="cbf-fnback" href="#fnref-1" aria-label="back to text">↩</a></li>
<li id="fn-2">I imagine the Claude Code environment did meaningfully change the results, given the system information / scaffolding that Claude sees from inside, but this seemed a necessary sacrifice to not have to pay API prices. I was able to do about 6 steps of RL within each 5-hour usage limit, with 6 rollouts x 8 groups per step. <a class="cbf-fnback" href="#fnref-2" aria-label="back to text">↩</a></li>
<li id="fn-3"><a href="https://delve.town/profile/noree.delve.town">https://delve.town/profile/noree.delve.town</a> <a class="cbf-fnback" href="#fnref-3" aria-label="back to text">↩</a></li>
</ol>
</section>

<script src="/postimages/claudes-best-friend/data.js"></script>
<script src="/postimages/claudes-best-friend/cbf.js"></script>
