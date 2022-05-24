import { rest } from 'msw';
import { setupServer } from 'msw/node';

import {
  carouselData,
  genericStatsData,
  about,
  highlights,
  news,
  welcome,
} from './home-data';
import articlesData from './articles-data';
import contactFormArticle from './contact.form-data';
import {
  classpieceData,
  classpiecesData,
  classpiecesFiltersData,
} from './classpieces-data';
import { eventData, eventsData } from './events-data';
import { searchData } from './search-data';
import { organisationsData, organisationData } from './organisations-data';
import { personData, peopleData, peopleFilters } from './people-data';
import { resourceData, resourcesData } from './resources-data';
import { spatialData, spatialsData } from './spatials-data';
import { temporalData, temporalsData } from './temporals-data';

const handlers = [
  rest.get('http://localhost:5100/api/carousel', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(carouselData), ctx.delay(150))
  ),

  rest.get('http://localhost:5100/api/generic-stats', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(genericStatsData), ctx.delay(150))
  ),

  rest.get('http://localhost:5100/api/content-article', (req, res, ctx) => {
    const permalink = req.url.searchParams.get('permalink');
    let output;
    switch (permalink) {
      case 'about':
        output = about;
        break;
      case 'contact':
        output = contactFormArticle;
        break;
      default:
        output = about;
        break;
    }
    return res(ctx.status(200), ctx.json(output), ctx.delay(150));
  }),

  rest.get('http://localhost:5100/api/content-articles', (req, res, ctx) => {
    const categoryName = req.url.searchParams.get('categoryName');
    let output;
    switch (categoryName) {
      case 'News':
        output = news;
        break;
      default:
        output = news;
        break;
    }
    return res(ctx.status(200), ctx.json(output), ctx.delay(150));
  }),

  rest.get('http://localhost:5100/api/content-category', (req, res, ctx) => {
    const permalink = req.url.searchParams.get('permalink');
    let output;
    switch (permalink) {
      case 'welcome-filte-vale':
        output = welcome;
        break;
      case 'about':
        output = articlesData;
        break;
      default:
        output = welcome;
        break;
    }
    return res(ctx.status(200), ctx.json(output), ctx.delay(150));
  }),

  rest.get('http://localhost:5100/api/ui-highlights', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(highlights), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/classpiece', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(classpieceData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/classpieces', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(classpiecesData), ctx.delay(150))
  ),
  rest.get(
    'http://localhost:5100/api/classpieces-active-filters',
    (req, res, ctx) =>
      res(ctx.status(200), ctx.json(classpiecesFiltersData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/ui-events', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(eventsData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/ui-event', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(eventData), ctx.delay(150))
  ),
  rest.post('http://localhost:5100/api/search', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(searchData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/ui-organisation', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(organisationData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/ui-organisations', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(organisationsData), ctx.delay(150))
  ),
  rest.post('http://localhost:5100/api/ui-people', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(peopleData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/ui-person', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(personData), ctx.delay(150))
  ),
  rest.post(
    'http://localhost:5100/api/ui-person-active-filters',
    (req, res, ctx) =>
      res(ctx.status(200), ctx.json(peopleFilters), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/ui-resources', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(resourcesData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/ui-resource', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(resourceData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/spatials', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(spatialsData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/spatial', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(spatialData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/ui-temporals', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(temporalsData), ctx.delay(150))
  ),
  rest.get('http://localhost:5100/api/ui-temporal', (req, res, ctx) =>
    res(ctx.status(200), ctx.json(temporalData), ctx.delay(150))
  ),
];

const server = setupServer(...handlers);
export default server;
