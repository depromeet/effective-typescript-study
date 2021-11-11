type Product = {
  name: string;
  id: string;
  price: number;
};

const elmo: Product = {
  name: "Tickle Me Elmo",
  id: "12312313",
  price: 30,
};

const furby: Product = {
  name: "Furby",
  id: 1231231231,
  price: 35,
};

const logProduct = (product: Product) => console.log(product);

logProduct(furby);
