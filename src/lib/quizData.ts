export const quizQuestions = [
  {
    id: 1,
    // Using a reliable placeholder for now
    imageUrl: "https://res.cloudinary.com/dlke6hzci/image/upload/v1769711861/mevtzdwk7niodzjq20la.jpg",
    isFake: true,
    explanation: "Look at the background texture and the unnatural lighting on the skin. These are common Stable Diffusion artifacts.",
  },
  {
    id: 2,
    imageUrl: "https://res.cloudinary.com/dlke6hzci/image/upload/v1769743262/images_cxzppm.jpg",
    isFake: false,
    explanation: "This is a real photo. The fur details are inconsistent in a way that is natural, and the depth of field (blur) matches real camera lenses.",
  },
  {
    id: 3,
    imageUrl: "https://res.cloudinary.com/dlke6hzci/image/upload/v1769711650/rj7iutb3ugc7ak3zr3hq.jpg", 
    isFake: false,
    explanation: "Check the eyes. AI often struggles with pupil symmetry and reflections (specular highlights) in the eyes.",
  },
  {
    id: 4,
    imageUrl: "https://res.cloudinary.com/dlke6hzci/image/upload/v1769709562/j3yujdn8op90t8sxpn6d.jpg",
    isFake: false,
    explanation: "Authentic image. The lighting shadows match the light source perfectly, and the object edges are sharp where expected.",
  }
];