$( document ).ready(function() {
  let urlInfo = /(https|http):\/\/item.jd.com\/([0-9]*).html/g.exec(window.location.href);
  let sku = urlInfo[2]
  let priceChartDOM = `
    <div class="jjbPriceChart">
      <h4 class="title">价格走势</h4>
      <div id="jjbPriceChart"></div>
      <span class="provider">京价保提供</span>
    </div>
  `;
  $(".product-intro").append(priceChartDOM);
  
  setTimeout( function(){
    $.get("https://jjb.zaoshu.so/price/" + sku, function (data) {
      if (data.length > 2) {
        var chart = new G2.Chart({
          container: 'jjbPriceChart',
          forceFit: true,
          padding: [50, '5%', 80, '6%'],
          height: 300
        });
        chart.source(data, {
          timestamp: {
            type: 'time',
            mask: 'MM-DD HH:mm',
            range: [0, 1],
            tickCount: 5
          }
        });
        chart.line().position('timestamp*value').shape('hv').color('key');
        chart.render();
      } else {
        $(".jjbPriceChart").hide()
      }
    });
  }, 1000)
});
