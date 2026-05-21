export class ElementBuilder {
  constructor(tag) {
    this.element = document.createElement(tag);
  }

  id(id) {
    this.element.dataset.imdbID = id;
    return this;
  }

  class(clazz) {
    this.element.classList.add(clazz);
    return this;
  }

  pluralizedText(content, array) {
    return this.text(array.length > 1 ? content + "s" : content);
  }

  text(content) {
    this.element.textContent = content;
    return this;
  }

  with(name, value) {
    this.element.setAttribute(name, value);
    return this;
  }

  listener(name, listener) {
    this.element.addEventListener(name, listener);
    return this;
  }

  append(child) {
    child.appendTo(this.element);
    return this;
  }

  appendTo(parent) {
    parent.append(this.element);
    return this.element;
  }

  insertBefore(parent, sibling) {
    parent.insertBefore(this.element, sibling);
    return this.element;
  }
}

export class ParentChildBuilder extends ElementBuilder {
  constructor(parentTag, childTag) {
    super(parentTag);
    this.childTag = childTag;
  }

  append(text) {
    const childCreator = new ElementBuilder(this.childTag).text(text);
    if (this.childClazz) {
      childCreator.class(this.childClazz);
    }

    super.append(childCreator);
  }

  childClass(childClazz) {
    this.childClazz = childClazz;
    return this;
  }

  items() {
    if (arguments.length === 1 && Array.isArray(arguments[0])) {
      arguments[0].forEach((item) => this.append(item));
    } else {
      for (var i = 0; i < arguments.length; i++) {
        this.append(arguments[i]);
      }
    }

    return this;
  }
}

class ParagraphBuilder extends ParentChildBuilder {
  constructor() {
    super("p", "span");
  }
}

class ListBuilder extends ParentChildBuilder {
  constructor() {
    super("ul", "li");
  }
}

function formatRuntime(runtime) {
  if (!Number.isFinite(runtime)) {
    return "Unknown runtime";
  }
  const hours = Math.trunc(runtime / 60);
  const minutes = runtime % 60;
  return hours + "h " + minutes + "m";
}

function formatReleaseDate(released) {
  if (!released) {
    return "Release date unknown";
  }

  const date = new Date(released);
  if (Number.isNaN(date.getTime())) {
    return "Release date unknown";
  }

  return "Released on " + date.toLocaleDateString("en-US");
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [];
}

export class MovieBuilder extends ElementBuilder {
  constructor(movie, deleteMovie, isLoggedIn) {
    const genres = ensureArray(movie.Genres);
    const directors = ensureArray(movie.Directors);
    const writers = ensureArray(movie.Writers);
    const actors = ensureArray(movie.Actors);

    super("article")
      .id(movie.imdbID)
      .append(new ElementBuilder("img").with("src", movie.Poster))
      .append(new ElementBuilder("h1").text(movie.Title));

    if (isLoggedIn) {
      this.append(
        new ElementBuilder("p")
          .append(new ButtonBuilder("Edit").onclick(() => location.href = "edit.html?imdbID=" + movie.imdbID))
          .append(new ButtonBuilder("Delete").onclick(() => deleteMovie(movie.imdbID)))
      );
    }

    this.append(
        new ParagraphBuilder().items(
          "Runtime " + formatRuntime(movie.Runtime),
          "\u2022",
          formatReleaseDate(movie.Released)
        )
      )
      .append(new ParagraphBuilder().childClass("genre").items(genres))
      .append(new ElementBuilder("p").text(movie.Plot || ""))
      .append(new ElementBuilder("h2").pluralizedText("Director", directors))
      .append(new ListBuilder().items(directors))
      .append(new ElementBuilder("h2").pluralizedText("Writer", writers))
      .append(new ListBuilder().items(writers))
      .append(new ElementBuilder("h2").pluralizedText("Actor", actors))
      .append(new ListBuilder().items(actors));
  }
}

export class ButtonBuilder extends ElementBuilder {
  constructor(text) {
    super("button").with("type", "button").text(text)
  }

  onclick(handler) {
    return this.listener("click", handler)
  }
}
