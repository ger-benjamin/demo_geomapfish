/**
 * Customization (override of functions) for the gmf layertree component.
 */
goog.provide('demo.layertree.gmfLayertreeCustomization');
goog.require('gmf.LayertreeController');
goog.require('ol.source.ImageWMS');

/**
 * A list of layer name bound to a dimension.
 * Example:  {'my_time_layer': 'time_dimensions_for_my_layer'}
 * @type {!Object.<string, string>}
 * @private
 */
gmf.LayertreeController.DIMENSIONS_FOR_WMST_LAYERS = {
  'osm_time_r_s': 'time'
};

/**
 * Update the timesliders behaviors. If a dimensions is found for the current
 * updated layer, set the dimension instead of the WMS-T value.
 * This code is required to be able to use the mapserver substitution and
 * so, to use WMS-T on multiple column.
 * 
 * Given dimension value will be a 'timestamp' for a single value slider, and a
 * 'timestamp1/timestamp2' for a range slider.
 *
 *
 * GMF layertree documentation:
 *
 * Update the `timeRangeValue` property of the data source bound to the
 * given tree controller using the given time. If the tree controller has
 * no data source, it means that it has children and they might have
 * data sources.
 *
 * The setting of the TIME parameter on the layer occurs in the
 * `gmf.DataSourcesManager` service
 *
 * LayertreeController.prototype.updateWMSTimeLayerState - description
 * @param {ngeo.LayertreeController} layertreeCtrl ngeo layertree controller
 * @param {{start : number, end : number}} time The start
 *     and optionally the end datetime (for time range selection) selected by
 *     user.
 * @export
 * @suppress {duplicate}
 */
gmf.LayertreeController.prototype.updateWMSTimeLayerState = function(
  layertreeCtrl, time) {
  if (!time) {
    return;
  }
  const dataSource = layertreeCtrl.getDataSource();
  if (dataSource) {

    // ----- customized part (start) -----
    const layername = dataSource.name;
    const dimension = gmf.LayertreeController.DIMENSIONS_FOR_WMST_LAYERS[layername]
    if (dimension) {
      const source = layertreeCtrl.layer.getSource();
      if (source && source instanceof ol.source.ImageWMS) {
        const pgsql_time = this.formatTimestampForPostreSQL_(time);
        // update query url
        dataSource.dimensionsConfig[dimension] = pgsql_time;
        // update getmap url
        const params = {};
        params[dimension] = pgsql_time;
        /** @type {ol.source.ImageWMS} */ (source).updateParams(params);
      // ----- customized part (end) -----

      }
    }
  } else if (layertreeCtrl.children) {
    for (let i = 0, ii = layertreeCtrl.children.length; i < ii; i++) {
      this.updateWMSTimeLayerState(layertreeCtrl.children[i], time);
    }
  }
};

/**
 * @param {{start : number, end : number}} time the time
 * @return {string} the postgresql timestamp '2006-4-20' (value), or
 *   '2006-4-20/2008-4-20' (range).
 * @private
 */
gmf.LayertreeController.prototype.formatTimestampForPostreSQL_ = function(time) {
  const s = new Date (time.start);
  let psqlTimestamp = `${s.getFullYear()}-${s.getMonth() + 1}-${s.getDate()}`
  // psqlTimestamp += ` ${s.getHours()}:${s.getMinutes()}:${s.getSeconds()}`;
  if (time.end) {
    const e = new Date(time.end);
    psqlTimestamp += `/${e.getFullYear()}-${e.getMonth() + 1}-${e.getDate()}`
    // psqlTimestamp += ` ${e.getHours()}:${e.getMinutes()}:${e.getSeconds()}`;
  }
  return psqlTimestamp;
};
