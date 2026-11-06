const stories = {
  "the-slow-sunday": {
    asset: "slow-unboxed",
    heading: "A little less hurry.",
    subheading: "Three little rituals.",
    intro:
      "An imagined bath-time trio, brought together for the person who deserves an afternoon of their own.",
    items: [
      {
        size: "250 g",
        text: "Rose-toned crystals in a tall amber jar. A visual idea for the bath-time chapter; the name does not describe a confirmed formula.",
      },
      {
        size: "200 mL",
        text: "A rounded cream jar with a deep berry lid. The soft counterpoint to amber glass, imagined for an everyday care ritual.",
      },
      {
        size: "90 g",
        text: "A small cream candle vessel completes the trio. Its scent and burn characteristics have not been developed.",
      },
    ],
    packHeading: "The quiet pleasure",
    packAccent: "of opening.",
    palette: "Warm ivory · deep berry · amber glass",
    opening:
      "A lift-off cream box, soft tissue and three distinct silhouettes.",
    gesture: "For the one who always makes time.",
    occasion:
      "A birthday, a thank-you, or simply a reminder to leave a little space in the day. The thought is the starting point.",
  },
  "the-little-thank-you": {
    asset: "little-unboxed",
    heading: "A small gesture.",
    subheading: "A very personal thought.",
    intro:
      "Two everyday companions, imagined as a simple way to acknowledge the little things someone does.",
    items: [
      {
        size: "50 mL",
        text: "An ivory hand-cream tube with a berry cap. Compact and familiar in shape, with a formula still to be developed.",
      },
      {
        size: "10 mL",
        text: "A slender golden fragrance miniature, paired with a matching berry cap. The scent is an open creative direction.",
      },
    ],
    packHeading: "Little details.",
    packAccent: "A lovely first impression.",
    palette: "Textured cream · berry accents · golden glass",
    opening:
      "A compact lift-off box, a soft tissue nest and a pair of contrasting shapes.",
    gesture: "For making an ordinary day better.",
    occasion:
      "The friend who listened. The host who made room. A little thank-you can hold a very specific memory.",
  },
  "the-evening-edit": {
    asset: "evening-unboxed",
    heading: "The day winds down.",
    subheading: "A new chapter begins.",
    intro:
      "Three warm-toned objects, arranged around the idea of an evening with nothing else to rush towards.",
    items: [
      {
        size: "100 mL",
        text: "An amber body-oil bottle with a dark dropper and golden collar. An evening-care idea, with no formula or efficacy claims.",
      },
      {
        size: "90 g",
        text: "A pale candle vessel offers a quiet contrast to the berry box. Scent and burn details remain part of the design brief.",
      },
      {
        size: "10 mL",
        text: "A golden fragrance miniature adds the final slender silhouette. Its scent and concentration have not been selected.",
      },
    ],
    packHeading: "A deeper shade",
    packAccent: "of thoughtful.",
    palette: "Deep berry · warm gold · soft cream",
    opening:
      "A hinged berry box opens onto pale tissue and a carefully considered trio.",
    gesture: "For their favorite part of the day.",
    occasion:
      "An evening person. A new chapter. A celebration kept close. This edit begins with the feeling of coming home to yourself.",
  },
};
export function giftStory(handle: string) {
  return stories[handle as keyof typeof stories];
}
