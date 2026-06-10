/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Testimonial {
  id: string;
  nameHy: string;
  nameEn: string;
  locationHy: string;
  locationEn: string;
  commentHy: string;
  commentEn: string;
  rating: number;
  avatar: string;
  productNameHy: string;
  productNameEn: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    nameHy: "Մանե Գևորգյան",
    nameEn: "Mane Gevorgyan",
    locationHy: "ք․ Երևան",
    locationEn: "Yerevan",
    commentHy: "Միկադո տորթը պարզապես հրաշք էր։ Շերտերը նուրբ էին, իսկ խտացրած կաթով կրեմը՝ չափավոր քաղցր։ Իսկական մանկության համն էր։ Առաքումը ճիշտ ժամանակին էր։",
    commentEn: "The Mikado cake was sheer perfection. Extremely delicate micro-shavings, balanced sweetness. It brought back pure childhood memories. High-speed delivery!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    productNameHy: "Կայսերական Միկադո",
    productNameEn: "Royal Mikado"
  },
  {
    id: "t2",
    nameHy: "Արթուր Սիմոնյան",
    nameEn: "Arthur Simonyan",
    locationHy: "ք․ Գյումրի",
    locationEn: "Gyumri",
    commentHy: "Պատվիրել էի անհատական ձևավորմամբ տորթ աղջկաս ծննդյան համար։ Գրվածքը շատ գեղեցիկ cursive-ով էր արված, իսկ ելակի միջուկն ու կանաչ կրեմը ճիշտ այնպիսին էին, ինչպիսին նախագծել էի կայքում։",
    commentEn: "Ordered a customized celebration cake for my daughter's birthday. The custom cursive inscription looked gorgeous. The requested raspberry filling tasted so fresh!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    productNameHy: "Կարմիր Վելվետ Սիմֆոնիա",
    productNameEn: "Red Velvet Symphony"
  },
  {
    id: "t3",
    nameHy: "Սոնա Մարտիրոսյան",
    nameEn: "Sona Martirosyan",
    locationHy: "ք․ Դիլիջան",
    locationEn: "Dilijan",
    commentHy: "Ավանդական Գաթան շատ համով էր, իսկական կարագով և խորիզով պատրաստված։ Արտաքին տեսքն ու զարդանախշերը ևս ակնահաճո էին։ Խորհուրդ եմ տալիս բոլորին։",
    commentEn: "The traditional round Gata was outstanding. Filled with genuine rich Khoriz core that melts on your tongue. Highly recommend this culinary masterpiece!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    productNameHy: "Ավանդական Կլոր Գաթա",
    productNameEn: "Traditional Armenian Gata"
  }
];
