$('#main-search').on('keyup', function(ev){
    fastdom.mutate(() => {
        updateAbilities($(this).val().toLowerCase())
        updateSpecies($(this).val().toLowerCase())
    });
})