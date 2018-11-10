const router = require('express').Router();
const { addPage, main, wikiPage, editPage } = require('../views');
const { Page, User } = require('../models');

module.exports = router;

router.get('/', async (req, res, next) => {
  try {
    const allPages = await Page.findAll();
    res.send(main(allPages));
  } catch (err) {
    next(err);
  }
});

router.get('/add', (req, res, next) => {
  res.send(addPage());
});

router.get('/:slug', async (req, res, next) => {
  try {
    const foundPage = await Page.findOne({
      where: { slug: req.params.slug },
    });
    if (!foundPage) {
      res.status(404).send('this page does not exist');
    }
    const author = await foundPage.getAuthor();
    res.send(wikiPage(foundPage, author));
  } catch (err) {
    next(err);
  }
});

router.get('/:slug/edit', async (req, res, next) => {
  try {
    const foundPage = await Page.findOne({
      where: { slug: req.params.slug },
    });
    if (!foundPage) {
      res.status(404).send('this page does not exist');
    }
    const author = await foundPage.getAuthor();
    res.send(editPage(foundPage, author));
  } catch (err) {
    next(err);
  }
});

router.get('/:slug/delete', async (req, res, next) => {
  try {
    await Page.destroy({
      where: { slug: req.params.slug },
    }).then(() => {
      res.redirect(`/wiki/`);
    });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const [user, wasCreated] = await User.findOrCreate({
      where: { name: req.body.name, email: req.body.email },
    });
    const page = await Page.create(req.body);
    // SHOULD WE BE USING THEN() HERE (AND ANY TIME WE AWAIT)?
    page.setAuthor(user);
    res.redirect(`/wiki/${page.slug}`);
  } catch (error) {
    next(error);
  }
});

router.post('/:slug', async (req, res, next) => {
  try {
    const [user, wasCreated] = await User.findOrCreate({
      where: { name: req.body.name, email: req.body.email },
    });
    await Page.update(req.body, {
      where: { slug: req.params.slug },
      returning: true,
    }).then(result => {
      // COMPARE THIS TO SOLUTION CODE
      const page = result[1][0];
      page.setAuthor(user);
      const pageData = page.dataValues;
      res.redirect(`/wiki/${pageData.slug}`);
    });
  } catch (error) {
    next(error);
  }
});
