/* global describe it */
import expect from 'expect';
import * as actions from 'app/actions/actions';

import Main from 'app/components/Main';

describe('Main Component', () => {
    it ('should exist', () => {
        expect(Main).toExist(); 
    });
});
