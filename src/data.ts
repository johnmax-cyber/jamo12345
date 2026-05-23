import { Product, ContactMessage, Order } from "./types";

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "Emerald Abaya",
    description: "Flowing silhouette with gold accent stitching and premium modest fit.",
    price: 12500,
    category: "clothes",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD5g5f_qQ8gRVwzQCCiMZ0Q_bgbaf4GFVWl5zMBDlIKQ2yMx0qjez6vrHhAj8p6pF9Jfp4DtfHp5KP81pQ34vIbXtUxaSuz5Y4FgsPfzJHMcuxcKsg7ekbFFmZu3fkv-D95KnmkszCR24R7OvnYMF7QcwmnTwXoBRNdLHNn0XQSev-HGx3Tb87GJM5uHDUA9SoxFgIZUTpY-GPfgCIP6EJ3WeFf4XKzcDOyqoCLx5K7pDKdAt99HNaGxnERqEbECKifatk44wUFTdG9",
    isNew: true
  },
  {
    id: "p2",
    title: "Modern Wisdom",
    description: "Essays on leadership and traditional African and global philosophy.",
    price: 3200,
    category: "books",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDGiydt9OH1mEm_0wcTRuDSyfESJ0veDqa_I_695KuQrYW-6dHLEbvb9L7JTgX75FpNs8BdW4i2rk_cPCkuWr5p3_aercaxiM0JUuuyTIU4jpGUQztBd-7wVcq0ro1aXGk1t8rR6AWn8-sQGnVfdnDN7aza5kN6frW_Cg8I4QlqGlAg17w73n1fKsthLCiLx1i32Enuv5XHJ4cyocMkDD5ixiBQ8vZuf1LVbmsywAy5oCU9fbezvEuz4K-KnmcJmMCVhBiJT0C9sVYL"
  },
  {
    id: "p3",
    title: "Ivory Tunic",
    description: "Lightweight silk blend for professional elegance and hot weather comfort.",
    price: 8400,
    category: "clothes",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJDefvoRxLtMviu-8ugwXfD7QBPcW74j4VcPa-fDoUusjpOtyr7IZ2xa1afiZJlT_EO6ZncBYaoQw2ZgGqiiyyZkofvOxwoIr2WiCgmXRmkGqT4mgvfGh-HS9edS1vxrIN03HoMHJCZc0tEDouQrDIqE3vBKcr-qNuVMwVEqCBTZWcqZtmJPhY2ms-DrIvtkrmA6REHPMM-9W_59jmpYVhS-TZlJjrX3Zf7L1olnkH_daKkFZ0B-Q1DmGm7P4N2OKzJfs1EIIn75w1",
    onSale: true,
    originalPrice: 10500
  },
  {
    id: "p4",
    title: "Silk Blend Hijab",
    description: "A beautifully draped, premium silk hijab in a soft olive green tone.",
    price: 3500,
    category: "clothes",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxuw9wQJj1u3T2NDQXyI44-Ad9Dcu3UnG_ldmTWKjk_gPgFCMMGEhGS5O_XoSvz-ZS3SUY8QqNBtujmW9rFDwkbD5qRsMID4wCgjVTGDEMWSytsAQ05eJvzuoTTd_GGtvJF4jU-q4CaLkVFAPpVT7JNOmeScWnn9GCUeIw-NqqJnldKiVxFN4u3JEuGAS7G5nruQ5DMCP_fX2HqQETlYs-qBfQUjfVWJiaegPvmtL-IyJrob9Rafk99HOPZZ3xNcO2qrxTfeuK5GDF",
    isNew: true
  },
  {
    id: "p5",
    title: "Spiritual Reflections",
    description: "Hardcover Edition of curated meditations and timeless ethical principles.",
    price: 2800,
    category: "books",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDiIlqxhbHfeAPJF-SPs3lN9EUKJua_2YD1C2FlqyvzabPExgEw-A53e_pzBDt0uAumh701DI-qAYS15b1rgUgoCAigutOViGW2FbRc7EIqfjLhd6Ala-hdj4pwMUZjkRjQyPIRphNm1NeU1jwYUiD6rlEYvxxStv51NuZihq2w_5UaD4hS_bZUu2bjYHFLQIscZCbBHnqP_O7WkJafvLF1wB1uehWlgwqo8lJk9yF4YLUc3YhnK7EHQLnHgx1b9yeE8aPgFtoy0i1q"
  },
  {
    id: "p6",
    title: "Classic Onyx Abaya",
    description: "A minimalist, full-length black abaya with subtle premium stitching.",
    price: 6500,
    category: "clothes",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuChcoG6zDlNhB9hpjtRQJHFS448NFZunFE-cPRl29vQnT2rtSIUr-KqZZrWEj-TeTavFqHRySL2A_TmeyzHIb2B-P5D_2j8lddWcJs0VcQyzb_yKLIY_wV4t51eQIyTqFlVw0xAH3QSzBY9OMuL5JUpWZBfYV99ity7x8BWEJcBmi5FpyDYo4uu1-agvLzvGAqvoEVSJDIcSjobbLfqQGCHWpSosZxImwTIvXKiABxoeAs_K9eG6SnqJtj0O1IGi7TLa6Xu2JP5J5ii"
  }
];

export const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: "msg-1",
    name: "Sarah K.",
    phone: "+254 721 987 654",
    interest: "Clothing Selection",
    message: "Could you send me details regarding the sizing for the Silk Kaftan and Velvet Abaya? Do you have custom dimensions?",
    date: "1 hour ago",
    isRead: false
  },
  {
    id: "msg-2",
    name: "Omar Ali",
    phone: "+254 733 444 555",
    interest: "Custom Tailoring",
    message: "I am interested in ordering custom matching abayas for my family. Can I schedule a fitting appointment this Saturday?",
    date: "Yesterday",
    isRead: false
  },
  {
    id: "msg-3",
    name: "Fatima Juma",
    phone: "+254 755 888 222",
    interest: "Accessories",
    message: "Your new Silk Hijab range looks incredible! Do you offer bulk order discounts for boutiques?",
    date: "3 days ago",
    isRead: true
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: "1042",
    customerName: "Grace M.",
    customerPhone: "+254 712 345 678",
    items: [
      {
        product: INITIAL_PRODUCTS[0], // Emerald Abaya
        quantity: 1
      },
      {
        product: INITIAL_PRODUCTS[1], // Modern Wisdom Book
        quantity: 1
      }
    ],
    totalAmount: 15700,
    status: "pending",
    deliveryLocation: "Westlands, Nairobi",
    paymentMethod: "M-Pesa",
    date: "10 min ago"
  },
  {
    id: "1041",
    customerName: "David Kimani",
    customerPhone: "+254 722 999 000",
    items: [
      {
        product: INITIAL_PRODUCTS[2], // Ivory Tunic
        quantity: 1
      }
    ],
    totalAmount: 8400,
    status: "completed",
    deliveryLocation: "Kilimani, Nairobi",
    paymentMethod: "M-Pesa",
    date: "Yesterday"
  },
  {
    id: "1040",
    customerName: "Amina Yusuf",
    customerPhone: "+254 701 112 233",
    items: [
      {
        product: INITIAL_PRODUCTS[5], // Classic Onyx Abaya
        quantity: 2
      }
    ],
    totalAmount: 13000,
    status: "completed",
    deliveryLocation: "Karen, Nairobi",
    paymentMethod: "Cash on Delivery",
    date: "2 days ago"
  }
];
