window.searchTimeout;

$('#main-search').on('keyup', function(ev){
    if (window.searchTimeout) clearTimeout(window.searchTimeout)
    window.searchTimeout = setTimeout(()=>{
        fastdom.mutate(() => {
            updateAbilities($(this).val().toLowerCase())
            updateSpecies($(this).val().toLowerCase())
            updateMoves($(this).val().toLowerCase())
            updateLocations($(this).val().toLowerCase())
            window.searchTimeout = null
        });
    }, 100)
    
})

$('#filter-icon').on('click', function(){
    $('#filter-data').toggle()
})