# Projeto básico de controle de agenda

> Projeto criado para teste de seleção da Cubos, resolvendo problema de controle de agenda

### Tecnologias Usadas
* NodeJS
* Jest
* Express
* Sucrase

### Pré-requisitos
* Se certifique que aplicação tenha permissão de escrita na pasta
* A aplicação pode ser rodada com NPM ou Yarn
* Caso a porta 3000 não esteja disponível, a const port deve ser alterada em server.js

### Passos para executar testes via NPM
1. `npm install`
2. `npm sequelize db:migrate`
3. `npm sequelize db:seed:all`
4. `npm test`

### Passos para executar testes via Yarn
1. `yarn install`
2. `yarn sequelize db:migrate`
3. `yarn sequelize db:seed:all`
4. `yarn test`

### Para deixar o servidor rodando com NPM
1. `npm dev` --> Inicia em modo debug colocando as saídas no console
2. `npm start` --> Inicia em modo de produção

### Para deixar o servidor rodando com Yarn
1. `yarn dev` --> Inicia em modo debug colocando as saídas no console
2. `yarn start` --> Inicia em modo de produção

### Observações
* No caso de dias da semana, domingo corresponde ao valor 0, segunda valor 1, e assim sucessivamente