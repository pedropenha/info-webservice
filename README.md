# 🚀 API Infoeste (Backend)

## 1. Objetivo do Projeto

Esta é a API RESTful do projeto **Infoeste**, um sistema completo para cadastro, gestão e recomendação de cursos e eventos.

Construída com Node.js, Express e MongoDB, esta API serve como o cérebro da aplicação, lidando com a lógica de negócios, autenticação de usuários, gerenciamento de banco de dados e a integração direta com o módulo de Inteligência Artificial (Google Gemini) para assistênca e recomendações.

---

## ✨ Funcionalidades Implementadas

O backend atualmente suporta três perfis principais (Usuário, Professor, Admin) através de um sistema de níveis.

### 👤 Usuário Comum
* **Autenticação**: Cadastro (`/api/auth/cadastro`) e Login (`/api/auth/login`) seguros.
* **Gerenciamento de Perfil**: O usuário pode atualizar suas próprias informações (`PUT /api/users/:id`), incluindo nome, email, proficiências e foto de perfil (enviada como Base64).
* **Visualização de Cursos**: Acesso ao catálogo de cursos (`GET /api/cursos`) com filtros e paginação.
* **Sistema de Inscrição**:
    * Inscrever-se em cursos (`POST /api/inscricoes`), com validação de pré-requisitos e controle de vagas (resultando em "Inscrito" ou "Fila de Espera").
    * Cancelar uma inscrição (`DELETE /api/inscricoes/:id`).
    * Listar todos os seus cursos inscritos (`GET /api/users/:id/inscricoes`).

### 🤖 Módulo de Inteligência Artificial (Gemini)
Esta é a funcionalidade central da API, dividida em duas frentes:

1.  **Assistente de Administração (Para Professores/Admins):**
    * **Geração de Conteúdo**: Cria descrições de cursos, listas de proficiências e conteúdo programático completo (ementas) sob demanda (`POST /api/gemini/descricao`, etc.).

2.  **Sistema de Recomendação Personalizada (Para Usuários):**
    * **Rota Dedicada (`POST /api/recomendacoes`)**: Uma rota complexa que:
        1.  Recebe o ID do usuário.
        2.  Busca as **proficiências** do usuário.
        3.  Busca os **pré-requisitos** de todos os cursos.
        4.  Busca os **cursos em que o usuário já está inscrito**.
        5.  Envia esses três conjuntos de dados para a IA.
        6.  A IA (via *prompt engineering* rigoroso) **normaliza, filtra e ranqueia** os resultados, priorizando cursos cujos pré-requisitos exatos são atendidos e que o usuário ainda não fez.
        7.  Retorna uma lista de recomendações com explicações personalizadas.

### 👑 Administrador
* Possui todas as permissões de usuário.
* **Gerenciamento de Usuários (CRUD)**: Acesso total ao `UserController` para criar, listar, editar e deletar usuários.
* **Gerenciamento de Cursos (CRUD)**: Acesso total ao `CursoController` para criar, editar e deletar cursos.
* Acesso às rotas de **Assistente de IA** para facilitar a criação de novos cursos.

---

## 🛠️ Tecnologias Utilizadas

* **Node.js**
* **Express.js**: Para roteamento e middlewares.
* **MongoDB**: Banco de dados NoSQL.
* **Mongoose**: Para modelagem de dados e conexão com o MongoDB.
* **Google Gemini API (`@google/genai`)**: Para todas as funcionalidades de IA.
* **CORS**: Para permitir a comunicação com o frontend.
* **Dotenv**: Para gerenciamento de variáveis de ambiente.
* **Body-Parser**: Configurado com limite estendido (`10mb`) para aceitar o upload de fotos de perfil em Base64.

---

## 📦 Instalação e Configuração

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/pedropenha/info-webservice.git](https://github.com/pedropenha/info-webservice.git)
    cd info-webservice
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto e adicione as seguintes chaves.

    ```.env
    # Porta em que o servidor irá rodar
    PORT=3000

    # String de conexão do seu banco MongoDB
    MONGODB_URI=mongodb://localhost:27017/infoest_db

    # Chaves da API do Google Gemini
    GEMINI_API_KEY=SUA_API_KEY_AQUI
    GEMINI_MODEL=gemini-2.5-flash
    ```

4.  **Inicie o servidor (modo de desenvolvimento):**
    ```bash
    npm start
    ```

## 📍 Principais Endpoints da API

* `POST /api/auth/login`: Autentica um usuário.
* `GET /api/cursos`: Lista todos os cursos (com filtros).
* `PUT /api/users/:id`: Atualiza o perfil do usuário (usado pela página de perfil).
* `GET /api/users/:id/inscricoes`: Busca todos os cursos de um usuário (usado pela página de perfil).
* `POST /api/inscricoes`: Inscreve um usuário em um curso.
* `DELETE /api/inscricoes/:id`: Cancela (desinscreve) um usuário de um curso.
* `POST /api/recomendacoes`: Rota principal da IA para gerar recomendações personalizadas.